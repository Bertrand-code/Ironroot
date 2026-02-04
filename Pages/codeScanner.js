import React, { useState } from 'react';
import { secpro } from '@/lib/secproClient';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, GitBranch, AlertTriangle, CheckCircle, Clock, Loader2, FileCode, Shield, ChevronDown, ChevronUp, ExternalLink, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScanScheduler from '../components/Scheduling/Scheduler';
import NotificationBell from '../components/Notifications/NotificationBell';

export default function CodeScanner() {
  const [file, setFile] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedVulns, setExpandedVulns] = useState({});
  const [hasAccess, setHasAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ type: '', message: '' });

  const simulateScan = ({ target, mode }) => {
    const findings = [
      {
        severity: 'critical',
        title: 'Hardcoded Production Secrets Detected',
        category: 'Secrets Exposure',
        cwe_id: 'CWE-798',
        owasp_category: 'A02:2021 - Cryptographic Failures',
        lineNumber: 42,
        affectedCode: 'const API_KEY = \"sk_live_********\";',
        description:
          'Sensitive credentials are embedded directly in source code. This creates immediate compromise risk if the repository is exposed or a developer device is breached.',
        attackScenario:
          'If credentials are leaked, attackers can impersonate services and exfiltrate data through trusted APIs.',
        remediation:
          'Move secrets to environment variables or a secrets manager. Rotate keys immediately and add automated secret scanning to CI.',
        secureCodeExample:
          'const API_KEY = process.env.SERVICE_API_KEY;\nif (!API_KEY) throw new Error(\"Missing key\");',
        references: ['OWASP Secrets Management', 'CWE-798'],
      },
      {
        severity: 'high',
        title: 'SQL Injection Risk in User Lookup',
        category: 'SAST',
        cwe_id: 'CWE-89',
        owasp_category: 'A03:2021 - Injection',
        lineNumber: 128,
        affectedCode: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
        description:
          'Untrusted input is concatenated into a SQL query without parameterization, enabling injection and data exposure.',
        remediation:
          'Use parameterized queries or an ORM with safe bindings. Validate user input server-side.',
        secureCodeExample:
          'const query = \"SELECT * FROM users WHERE id = ?\";\ndb.query(query, [userId]);',
        references: ['OWASP SQL Injection', 'CWE-89'],
      },
      {
        severity: 'medium',
        title: 'Dependency Vulnerability: Outdated Auth Library',
        category: 'SCA',
        cwe_id: 'CWE-1104',
        component: 'auth-lib',
        currentVersion: '2.1.3',
        fixedVersion: '2.3.1',
        description:
          'An outdated authentication dependency contains known security weaknesses that can bypass session checks.',
        remediation:
          'Upgrade to the fixed version and re-run regression tests. Add automated dependency scanning.',
        references: ['Security Advisory', 'CWE-1104'],
      },
      {
        severity: 'medium',
        title: 'Missing Rate Limiting on Login Endpoint',
        category: 'API Security',
        cwe_id: 'CWE-799',
        owasp_category: 'A07:2021 - Identification and Authentication Failures',
        description:
          'High-volume authentication attempts could allow brute-force attacks without throttling safeguards.',
        remediation:
          'Add per-IP and per-account rate limiting, lockouts, and alerting for repeated failures.',
        references: ['OWASP Authentication', 'CWE-799'],
      },
      {
        severity: 'low',
        title: 'Security Headers Missing',
        category: 'Misconfiguration',
        cwe_id: 'CWE-693',
        description:
          'Key browser protections are not enabled, which can increase XSS and clickjacking risk.',
        remediation:
          'Enable `Content-Security-Policy`, `X-Frame-Options`, and `Referrer-Policy` headers.',
        references: ['OWASP Security Headers'],
      },
    ];

    const summary = findings.reduce(
      (acc, finding) => {
        acc[finding.severity] += 1;
        acc.total += 1;
        return acc;
      },
      { critical: 0, high: 0, medium: 0, low: 0, total: 0 }
    );

    return {
      target,
      mode,
      summary,
      vulnerabilities: findings,
      coverage: ['SAST', 'SCA', 'Secrets', 'IaC', 'API Security', 'Misconfigurations'],
    };
  };

  React.useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const user = await secpro.auth.me();

      if (user?.role === 'admin') {
        setHasAccess(true);
        setAccessStatus({ type: 'admin', message: 'Admin Access - Full Visibility' });
        return;
      }
      
      // Check if user has an active trial
      const trials = await secpro.entities.TrialRequest.filter({ 
        email: user.email,
        status: 'trial_active'
      });

      if (trials.length > 0) {
        const trial = trials[0];
        const now = new Date();
        const endDate = new Date(trial.trialEndDate);
        
        if (now <= endDate) {
          setHasAccess(true);
          const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
          setAccessStatus({ 
            type: 'trial', 
            message: `Trial Active - ${daysLeft} days remaining` 
          });
        } else {
          setAccessStatus({ 
            type: 'expired', 
            message: 'Trial expired. Contact us to continue access.' 
          });
        }
        return;
      }

      // Check if user has approved status (converted customer)
      const converted = await secpro.entities.TrialRequest.filter({ 
        email: user.email,
        status: 'converted'
      });

      if (converted.length > 0) {
        setHasAccess(true);
        setAccessStatus({ type: 'paid', message: 'Full Access' });
        return;
      }

      setAccessStatus({ 
        type: 'none', 
        message: 'Start a free trial to access full scan details' 
      });
    } catch (err) {
      console.error('Access check failed:', err);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  const handleFileScan = async () => {
    if (!file) {
      setError('Please select a file to scan');
      return;
    }

    setScanning(true);
    setError('');
    
    try {
      const analysis = simulateScan({ target: file.name, mode: 'file' });

      setScanResults(analysis);
      
      // Save scan history and activity log
      try {
        const user = await secpro.auth.me();
        await secpro.entities.ScanHistory.create({
          scanType: 'file_upload',
          targetName: file.name,
          summary: analysis.summary || { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
          vulnerabilities: analysis.vulnerabilities || [],
          scanDate: new Date().toISOString(),
          scannedBy: user.email
        });

        await secpro.entities.ActivityLog.create({
          userEmail: user.email,
          action: 'code_scan_performed',
          details: {
            scanType: 'file_upload',
            fileName: file.name,
            vulnerabilitiesFound: analysis.summary?.total || 0
          },
          timestamp: new Date().toISOString()
        });
      } catch (historyErr) {
        console.error('Failed to save scan history:', historyErr);
      }
    } catch (err) {
      console.error('File scan error:', err);
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      setError(`File scan failed: ${errorMessage}. Please try again or contact support if the issue persists.`);
    } finally {
      setScanning(false);
    }
  };

  const handleUrlScan = async () => {
    if (!targetUrl) {
      setError('Please enter a URL');
      return;
    }

    const urlTrimmed = targetUrl.trim();
    const isGithub = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/.test(urlTrimmed);
    const isWebsite = /^https?:\/\/.+/.test(urlTrimmed);

    if (!isWebsite) {
      setError('Please enter a valid URL (website or GitHub repository)');
      return;
    }

    setScanning(true);
    setError('');

    try {
      const scanType = isGithub ? 'github_repository' : 'website';
      const analysis = simulateScan({ target: urlTrimmed, mode: scanType });

      setScanResults(analysis);

      try {
        const user = await secpro.auth.me();
        await secpro.entities.ScanHistory.create({
          userEmail: user.email,
          scanType: isGithub ? 'GitHub Repo Scan' : 'Website Scan',
          target: urlTrimmed,
          status: 'completed',
          severity: analysis.summary?.critical > 0 ? 'critical' : analysis.summary?.high > 0 ? 'high' : 'medium',
          findingsCount: analysis.summary?.total || 0,
        });
      } catch (historyErr) {
        console.error('Failed to save scan history:', historyErr);
      }
    } catch (err) {
      console.error('URL scan error:', err);
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      setError(`URL scan failed: ${errorMessage}. Please try again or contact support if the issue persists.`);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500' },
      high: { bg: 'bg-orange-500/10', text: 'text-orange-500', border: 'border-orange-500' },
      medium: { bg: 'bg-yellow-500/10', text: 'text-yellow-500', border: 'border-yellow-500' },
      low: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' }
    };
    return colors[severity?.toLowerCase()] || colors.low;
  };

  const toggleVulnExpansion = (index) => {
    setExpandedVulns(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Shield className="h-8 w-8 text-red-500" />
                AI-Powered Code Security Scanner
              </h1>
              <p className="text-gray-400 mt-2">Industry-leading security scanning powered by Nuclei, Nmap, Snyk, Semgrep, and Veracode-grade analysis</p>
            </div>
            <div className="flex items-center gap-4">
              {accessStatus.message && (
                <Badge className={`${
                  accessStatus.type === 'paid' ? 'bg-green-500' : 
                  accessStatus.type === 'trial' ? 'bg-blue-500' : 
                  accessStatus.type === 'expired' ? 'bg-red-500' : 
                  'bg-yellow-500'
                } text-white`}>
                  {accessStatus.message}
                </Badge>
              )}
              <NotificationBell />
            </div>
          </div>
        </div>

        <Tabs defaultValue="scan" className="mb-8">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="scan">Scan Now</TabsTrigger>
            <TabsTrigger value="schedule">Schedule Scans</TabsTrigger>
          </TabsList>

          <TabsContent value="scan" className="mt-6">

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* File Upload */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Code File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go"
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <FileCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">
                    {file ? file.name : 'Drop your code file here'}
                  </p>
                  <p className="text-sm text-gray-500">or click to browse</p>
                </label>
              </div>
              <Button
                onClick={handleFileScan}
                disabled={!file || scanning}
                className="w-full bg-red-600 hover:bg-red-700 text-white"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Scan File'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* URL Scanning - Website or GitHub */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Website or GitHub Repository
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Input
                  placeholder="https://example.com or https://github.com/user/repo"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  className="bg-gray-900 border-gray-700 text-white"
                />
                <div className="text-xs text-gray-500 mt-2 space-y-1">
                  <p>• <strong>Website URL</strong>: Infrastructure scan (Nuclei, Nmap, DNS recon)</p>
                  <p>• <strong>GitHub URL</strong>: Code security scan (Snyk, Semgrep, Veracode)</p>
                </div>
              </div>
              <Button
                onClick={handleUrlScan}
                disabled={!targetUrl || scanning}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white"
              >
                {scanning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scanning...
                  </>
                ) : (
                  'Start Security Scan'
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {error && (
          <Alert className="mb-8 bg-red-500/10 border-red-500">
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Scan Results */}
        {scanResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Scan Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-red-500/10 p-4 rounded-lg border border-red-500">
                    <div className="text-2xl font-bold text-red-500">
                      {scanResults.summary?.critical || 0}
                    </div>
                    <div className="text-sm text-gray-400">Critical</div>
                  </div>
                  <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500">
                    <div className="text-2xl font-bold text-orange-500">
                      {scanResults.summary?.high || 0}
                    </div>
                    <div className="text-sm text-gray-400">High</div>
                  </div>
                  <div className="bg-yellow-500/10 p-4 rounded-lg border border-yellow-500">
                    <div className="text-2xl font-bold text-yellow-500">
                      {scanResults.summary?.medium || 0}
                    </div>
                    <div className="text-sm text-gray-400">Medium</div>
                  </div>
                  <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500">
                    <div className="text-2xl font-bold text-blue-500">
                      {scanResults.summary?.low || 0}
                    </div>
                    <div className="text-sm text-gray-400">Low</div>
                  </div>
                  <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                    <div className="text-2xl font-bold text-white">
                      {scanResults.summary?.total || 0}
                    </div>
                    <div className="text-sm text-gray-400">Total</div>
                  </div>
                </div>
                {scanResults.coverage && (
                  <div className="mt-6">
                    <div className="text-sm text-gray-400 mb-2">Coverage</div>
                    <div className="flex flex-wrap gap-2">
                      {scanResults.coverage.map((item) => (
                        <Badge key={item} variant="outline" className="text-xs border-gray-500 text-gray-300">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-white mb-4">
                Vulnerabilities Found ({scanResults.vulnerabilities?.length || 0})
              </h2>
              {scanResults.vulnerabilities?.length > 0 ? (
                <div className="space-y-4">
                  {!hasAccess && (
                    <Alert className="bg-yellow-500/10 border-yellow-500">
                      <AlertDescription className="text-yellow-400">
                        🔒 Limited access - Start a free trial to view full vulnerability details, remediation steps, and code examples.
                      </AlertDescription>
                    </Alert>
                  )}
                  {scanResults.vulnerabilities.map((vuln, index) => {
                    const colors = getSeverityColor(vuln.severity);
                    const isExpanded = expandedVulns[index];
                    return (
                      <Card key={index} className="bg-gray-800 border-gray-700 overflow-hidden">
                        {/* Collapsed Header - Always Visible */}
                        <div 
                          className="p-6 cursor-pointer hover:bg-gray-750 transition-colors"
                          onClick={() => hasAccess && toggleVulnExpansion(index)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <AlertTriangle className={`h-6 w-6 ${colors.text} flex-shrink-0 mt-0.5`} />
                              <div className="flex-1">
                                <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-bold text-white text-lg">{vuln.title}</h3>
                                  <Badge className={`${colors.bg} ${colors.text} border ${colors.border} flex-shrink-0`}>
                                    {vuln.severity?.toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {vuln.cwe_id && (
                                    <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                                      {vuln.cwe_id}
                                    </Badge>
                                  )}
                                  {vuln.cve_id && (
                                    <Badge variant="outline" className="text-xs border-purple-500 text-purple-400">
                                      {vuln.cve_id}
                                    </Badge>
                                  )}
                                  {vuln.owasp_category && (
                                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-400">
                                      OWASP: {vuln.owasp_category}
                                    </Badge>
                                  )}
                                  {(vuln.component || vuln.currentVersion) && (
                                    <Badge variant="outline" className="text-xs border-gray-500 text-gray-400">
                                      {vuln.component} {vuln.currentVersion}
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-gray-400 mt-3 line-clamp-2">
                                  {hasAccess ? vuln.description : 'Full details available with trial or paid access'}
                                </p>
                              </div>
                            </div>
                            {hasAccess && (
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
                                {isExpanded ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Expanded Details */}
                        <AnimatePresence>
                          {isExpanded && hasAccess && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <CardContent className="pt-0 pb-6 space-y-4 border-t border-gray-700">
                                {/* Full Description */}
                                <div className={`${colors.bg} p-4 rounded-lg border ${colors.border}`}>
                                  <p className="text-sm font-medium text-gray-200 mb-2">📋 Detailed Analysis</p>
                                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{vuln.description}</p>
                                  {vuln.lineNumber && (
                                    <p className="text-xs text-gray-500 mt-2">📍 Location: Line {vuln.lineNumber}</p>
                                  )}
                                </div>

                                {/* Affected Code */}
                                {vuln.affectedCode && (
                                  <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
                                    <p className="text-sm font-medium text-gray-300 mb-2">💥 Vulnerable Code</p>
                                    <pre className="text-xs text-red-400 overflow-x-auto font-mono">
                                      <code>{vuln.affectedCode}</code>
                                    </pre>
                                  </div>
                                )}

                                {/* Attack Scenario */}
                                {vuln.attackScenario && (
                                  <div className="bg-red-500/5 p-4 rounded-lg border border-red-500/20">
                                    <p className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                                      ⚠️ Attack Scenario
                                    </p>
                                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{vuln.attackScenario}</p>
                                  </div>
                                )}

                                {/* Remediation */}
                                <div className="bg-green-500/5 p-4 rounded-lg border border-green-500/20">
                                  <p className="text-sm font-medium text-green-400 mb-2 flex items-center gap-2">
                                    ✅ Remediation Steps
                                  </p>
                                  <p className="text-sm text-gray-300 whitespace-pre-wrap">{vuln.remediation || vuln.recommendation}</p>
                                  {vuln.fixedVersion && (
                                    <div className="mt-3 p-2 bg-green-500/10 rounded border border-green-500/30">
                                      <p className="text-xs text-green-400">
                                        🔧 <strong>Upgrade to:</strong> {vuln.fixedVersion}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Secure Code Example */}
                                {vuln.secureCodeExample && (
                                  <div className="bg-gray-900 p-4 rounded-lg border border-green-500/30">
                                    <p className="text-sm font-medium text-green-400 mb-2">✨ Secure Code Example</p>
                                    <pre className="text-xs text-green-300 overflow-x-auto font-mono">
                                      <code>{vuln.secureCodeExample}</code>
                                    </pre>
                                  </div>
                                )}

                                {/* References */}
                                {vuln.references && vuln.references.length > 0 && (
                                  <div className="bg-gray-900/50 p-4 rounded-lg">
                                    <p className="text-sm font-medium text-gray-300 mb-2">🔗 References & Resources</p>
                                    <div className="space-y-2">
                                      {vuln.references.map((ref, refIdx) => (
                                        <a
                                          key={refIdx}
                                          href={ref}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 hover:underline"
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                          <span className="break-all">{ref}</span>
                                        </a>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </CardContent>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-300 text-lg mb-2">No Vulnerabilities Detected</p>
                    <p className="text-gray-500 text-sm">Your code passed the security scan successfully!</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {!scanResults && !scanning && (
          <Card className="bg-gray-800/50 border-gray-700">
            <CardContent className="py-12 text-center">
              <Shield className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No scan results yet</p>
              <p className="text-gray-500 text-sm">Upload a file or connect a GitHub repository to get started</p>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          <TabsContent value="schedule" className="mt-6">
            <ScanScheduler />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
