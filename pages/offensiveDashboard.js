import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Target, AlertCircle, Zap, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportGenerator from '../components/Reports/ReportGenerator';
import NotificationBell from '../components/Notifications/NotificationBell';
import AuthGate from '@/components/AuthGate';
import { ironroot } from '@/lib/ironrootClient';

export default function OffensiveDashboard() {
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [expandedEngagement, setExpandedEngagement] = useState(null);
  const [integrationStatus, setIntegrationStatus] = useState([]);
  const [pentestTarget, setPentestTarget] = useState('https://app.customer.com');
  const [pentestResult, setPentestResult] = useState(null);
  const [pentestLoading, setPentestLoading] = useState(false);
  useEffect(() => {
    const loadStatus = async () => {
      const status = await ironroot.integrations.External.status();
      setIntegrationStatus(status);
    };
    loadStatus();
  }, []);

  const runPentest = async () => {
    setPentestLoading(true);
    try {
      const result = await ironroot.integrations.Pentest.run({ target: pentestTarget });
      setPentestResult(result);
    } catch (err) {
      setPentestResult({
        target: pentestTarget,
        error: 'Unable to run AI pentest at this time.',
      });
    } finally {
      setPentestLoading(false);
    }
  };

  const engagements = [
    { 
      name: 'Web App Penetration Test', 
      target: 'app.client.com', 
      status: 'In Progress', 
      findings: 12, 
      critical: 3,
      scope: 'Full application security assessment including authentication, authorization, and business logic testing',
      startDate: '2026-01-02',
      timeline: '2 weeks',
      methodology: 'OWASP Testing Guide, PTES methodology',
      keyFindings: ['SQL Injection in login form', 'XSS in search functionality', 'IDOR in user profiles']
    },
    { 
      name: 'Network Infrastructure Scan', 
      target: '10.0.0.0/24', 
      status: 'Completed', 
      findings: 28, 
      critical: 7,
      scope: 'External and internal network scanning, service enumeration, vulnerability assessment',
      startDate: '2025-12-15',
      timeline: '1 week',
      methodology: 'Nmap, Nessus Professional, Metasploit Framework',
      keyFindings: ['Exposed RDP services', 'Outdated SMB protocols', 'Unpatched Windows servers with critical CVEs']
    },
    { 
      name: 'API Security Assessment', 
      target: 'api.service.com', 
      status: 'Reporting', 
      findings: 15, 
      critical: 4,
      scope: 'REST API security testing, authentication bypass attempts, data validation testing',
      startDate: '2025-12-20',
      timeline: '1.5 weeks',
      methodology: 'OWASP API Security Top 10, Burp Suite Professional',
      keyFindings: ['Broken Object Level Authorization', 'Missing rate limiting', 'Sensitive data in API responses']
    },
    { 
      name: 'Social Engineering Campaign', 
      target: 'employees@corp.com', 
      status: 'Active', 
      findings: 8, 
      critical: 2,
      scope: 'Phishing simulation, pretexting calls, physical security assessment',
      startDate: '2026-01-05',
      timeline: '3 weeks',
      methodology: 'SET (Social Engineering Toolkit), Gophish, custom scenarios',
      keyFindings: ['42% click rate on phishing emails', 'Tailgating successful at main entrance', 'Password sharing observed']
    },
  ];

  const recentFindings = [
    { 
      id: 'VUL-001', 
      severity: 'Critical', 
      title: 'SQL Injection in Login Form', 
      cvss: 9.8, 
      status: 'Open',
      description: 'A SQL injection vulnerability exists in the login form, allowing attackers to bypass authentication and execute arbitrary SQL commands.',
      impact: 'Complete database compromise, unauthorized access to all user accounts, data exfiltration, and potential system takeover.',
      remediation: 'Implement prepared statements with parameterized queries, use ORM frameworks, validate and sanitize all user inputs, apply principle of least privilege for database accounts.'
    },
    { 
      id: 'VUL-002', 
      severity: 'High', 
      title: 'Cross-Site Scripting (XSS)', 
      cvss: 7.5, 
      status: 'Open',
      description: 'Reflected XSS vulnerability found in search functionality allows execution of malicious JavaScript in victim browsers.',
      impact: 'Session hijacking, credential theft, malware distribution, and defacement of the application for targeted users.',
      remediation: 'Implement proper output encoding, use Content Security Policy (CSP), sanitize user inputs, and employ context-aware escaping.'
    },
    { 
      id: 'VUL-003', 
      severity: 'Critical', 
      title: 'Remote Code Execution via API', 
      cvss: 9.1, 
      status: 'Validated',
      description: 'Insecure deserialization in API endpoint allows attackers to execute arbitrary code on the server.',
      impact: 'Full system compromise, ability to execute commands with application privileges, data theft, and lateral movement within the network.',
      remediation: 'Avoid deserializing untrusted data, implement signature verification, use simple data formats (JSON), update deserialization libraries, and apply input validation.'
    },
    { 
      id: 'VUL-004', 
      severity: 'Medium', 
      title: 'Weak Password Policy', 
      cvss: 5.3, 
      status: 'Open',
      description: 'Current password policy allows weak passwords (minimum 6 characters, no complexity requirements), making accounts vulnerable to brute-force attacks.',
      impact: 'Increased risk of account compromise through password guessing, brute-force, or credential stuffing attacks.',
      remediation: 'Enforce minimum 12-character passwords with complexity requirements, implement account lockout mechanisms, enable multi-factor authentication, and use password strength meters.'
    },
    { 
      id: 'VUL-005', 
      severity: 'High', 
      title: 'Insecure Direct Object Reference', 
      cvss: 8.2, 
      status: 'Open',
      description: 'User profile endpoints expose sequential IDs allowing unauthorized access to other users\' sensitive information by manipulating URL parameters.',
      impact: 'Unauthorized access to private user data, potential identity theft, privacy violations, and regulatory compliance issues (GDPR, CCPA).',
      remediation: 'Implement proper authorization checks, use indirect reference maps, validate user permissions on every request, and employ UUIDs instead of sequential IDs.'
    },
  ];

  const pentestTimeline = [
    { phase: 'Recon', status: 'Complete', owner: 'AI Hunter', detail: 'Asset intelligence enriched from Shodan & Censys' },
    { phase: 'Initial Access', status: 'Complete', owner: 'RedBot', detail: 'Weak OAuth tokens exploited via API gateway' },
    { phase: 'Persistence', status: 'Active', owner: 'Striker', detail: 'Created stealth service account with MFA bypass reroute' },
    { phase: 'Privilege Escalation', status: 'Queued', owner: 'Commander', detail: 'Gathering IAM misconfig data for lateral movement' },
    { phase: 'Impact', status: 'Queued', owner: 'Storm', detail: 'Prepping data exfil/PDR scenarios' },
  ];
  const fixPipeline = [
    { title: 'Lock down IAM roles', status: 'In Progress', owner: 'Security Ops', eta: '2h', detail: 'Attacker controlled IAM policy due to wildcards' },
    { title: 'Rotate exposed API tokens', status: 'Pending', owner: 'DevOps Team', eta: '8h', detail: 'Multiple services share the same static key' },
    { title: 'Apply WAF rules on auth endpoints', status: 'Scheduled', owner: 'AppSec', eta: 'Tomorrow', detail: 'Block brute-force patterns and anomalous geos' },
  ];
  const severityLevels = ['Critical', 'High', 'Medium', 'Low'];
  const riskCategories = ['Injection', 'Auth', 'Cloud', 'Dependencies', 'Misconfiguration'];
  const riskHeatmap = riskCategories.map((category) => {
    const rowCounts = severityLevels.map((level) => {
      const match = recentFindings.filter(
        (item) =>
          item.severity === level &&
          (item.title.toLowerCase().includes(category.toLowerCase()) ||
            item.description.toLowerCase().includes(category.toLowerCase()))
      ).length;
      return { level, count: match };
    });
    return { category, rowCounts };
  });

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'text-red-500 bg-red-500/10 border-red-500/30',
      High: 'text-orange-500 bg-orange-500/10 border-orange-500/30',
      Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
      Low: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
    };
    return colors[severity] || colors.Medium;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Offensive Security Dashboard</h1>
            <p className="text-gray-400">Active engagements and vulnerability findings</p>
          </div>
          <NotificationBell />
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Active Engagements', value: '4', icon: Target, color: 'text-red-500' },
            { label: 'Critical Findings', value: '16', icon: AlertCircle, color: 'text-orange-500' },
            { label: 'Total Vulnerabilities', value: '63', icon: Zap, color: 'text-yellow-500' },
            { label: 'Reports Generated', value: '12', icon: FileText, color: 'text-blue-500' },
          ].map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{metric.label}</CardTitle>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <AuthGate
          title="Sign in to access offensive operations"
          description="Red-team programs, AI pentest execution, and detailed findings are available after login."
          plans={['paid']}
          feature="advancedPentest"
        >
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Offensive Toolchain Coverage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-300">
                {[
                  { title: 'Recon & Asset Discovery', tools: 'ASM, DNS recon, passive intel' },
                  { title: 'Web & API Testing', tools: 'Burp Suite, OWASP API checks' },
                  { title: 'Exploit Validation', tools: 'Safe PoC validation, exploitability scoring' },
                  { title: 'Cloud & IaC', tools: 'CSPM checks, IaC misconfig scans' },
                  { title: 'Credential Hygiene', tools: 'Password audits, MFA enforcement' },
                  { title: 'Social Engineering', tools: 'Phish simulations, awareness testing' },
                ].map((item) => (
                  <div key={item.title} className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                    <p className="text-white font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-400">{item.tools}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Pentest Program</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">
                Continuous AI-driven pentest cycles simulate attacker behavior, validate exploitability, and map blast radius across cloud, API, and application tiers.
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs text-gray-400 mt-4">
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                  Attack Paths: 12 active
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                  Exploitability Score: 8.6
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                  Auto Playbooks: 6 ready
                </div>
                <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                  Red-Team Coverage: 91%
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Powered by adversary emulation, chained exploit validation, and continuous retest orchestration.
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Pentest Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-3">
                <Input
                  value={pentestTarget}
                  onChange={(e) => setPentestTarget(e.target.value)}
                  placeholder="Target (domain, app, or asset group)"
                  className="bg-gray-900 border-gray-700 text-white md:col-span-2"
                />
                <Button
                  onClick={runPentest}
                  disabled={!pentestTarget || pentestLoading}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {pentestLoading ? 'Running…' : 'Run AI Pentest'}
                </Button>
              </div>
              {pentestResult && (
                <div className="mt-4 space-y-3">
                  {pentestResult.error ? (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded">
                      {pentestResult.error}
                    </div>
                  ) : (
                    <>
                      <div className="grid md:grid-cols-3 gap-3 text-xs text-gray-300">
                        <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                          Target: <span className="text-white">{pentestResult.target}</span>
                        </div>
                        <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                          Attack Paths: <span className="text-white">{pentestResult.attackPaths}</span>
                        </div>
                        <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                          Exploitability Score: <span className="text-white">{pentestResult.exploitabilityScore}</span>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-3">
                        <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-2">Kill Chain</p>
                          <div className="space-y-2">
                            {pentestResult.killChain.map((stage) => (
                              <div key={stage.stage} className="flex items-center justify-between text-xs">
                                <span className="text-gray-200">{stage.stage}</span>
                                <span className={`px-2 py-1 rounded-full ${
                                  stage.status === 'complete' ? 'bg-green-500/10 text-green-400' :
                                  stage.status === 'active' ? 'bg-blue-500/10 text-blue-400' : 'bg-gray-700 text-gray-400'
                                }`}>
                                  {stage.status}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                          <p className="text-xs text-gray-400 mb-2">Top Findings</p>
                          <ul className="text-xs text-gray-300 space-y-1">
                            {pentestResult.highlights.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                          <p className="text-xs text-gray-400 mt-3">Recommended Actions</p>
                          <ul className="text-xs text-gray-300 space-y-1 mt-1">
                            {pentestResult.recommendedActions.map((item) => (
                              <li key={item}>• {item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">AI Pentest Signal Feeds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-300">
                {integrationStatus.map((item) => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-900/60 p-3 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-white font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500">{item.category}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      item.enabled ? 'bg-green-500/10 text-green-400' : 'bg-gray-700 text-gray-400'
                    }`}>
                      {item.enabled ? (item.mode === 'demo' ? 'Demo' : 'Connected') : 'Not Configured'}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Connect external APIs for automated enrichment, exploit matching, and attack surface context.
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Active Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Engagement</th>
                      <th className="py-3 pr-4">Target</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Findings</th>
                      <th className="py-3 pr-4">Critical</th>
                      <th className="py-3 pr-4">Start</th>
                      <th className="py-3 pr-4">Timeline</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {engagements.map((engagement, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="py-3 pr-4 text-white">{engagement.name}</td>
                          <td className="py-3 pr-4 text-gray-400">{engagement.target}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-3 py-1 rounded-full ${
                              engagement.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                              engagement.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                              engagement.status === 'Active' ? 'bg-yellow-500/10 text-yellow-500' :
                              'bg-purple-500/10 text-purple-500'
                            }`}>
                              {engagement.status}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{engagement.findings}</td>
                          <td className="py-3 pr-4 text-red-400">{engagement.critical}</td>
                          <td className="py-3 pr-4 text-gray-400">{engagement.startDate}</td>
                          <td className="py-3 pr-4 text-gray-400">{engagement.timeline}</td>
                          <td className="py-3 pr-4">
                            <Button
                              variant="ghost"
                              onClick={() => setExpandedEngagement(expandedEngagement === index ? null : index)}
                            >
                              {expandedEngagement === index ? 'Hide' : 'Details'}
                            </Button>
                          </td>
                        </tr>
                        {expandedEngagement === index && (
                          <tr>
                            <td colSpan={8} className="py-4">
                              <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700 space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-400 mb-1">Scope</h5>
                                    <p className="text-sm text-gray-300">{engagement.scope}</p>
                                  </div>
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-400 mb-1">Methodology</h5>
                                    <p className="text-sm text-gray-300">{engagement.methodology}</p>
                                  </div>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-400 mb-1">Key Findings</h5>
                                  <ul className="list-disc list-inside space-y-1">
                                    {engagement.keyFindings.map((finding, idx) => (
                                      <li key={idx} className="text-sm text-gray-300">{finding}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">ID</th>
                      <th className="py-3 pr-4">Finding</th>
                      <th className="py-3 pr-4">Severity</th>
                      <th className="py-3 pr-4">CVSS</th>
                      <th className="py-3 pr-4">Status</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentFindings.map((finding, index) => (
                      <React.Fragment key={index}>
                        <tr>
                          <td className="py-3 pr-4 text-gray-400">{finding.id}</td>
                          <td className="py-3 pr-4 text-white">{finding.title}</td>
                          <td className="py-3 pr-4">
                            <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(finding.severity)}`}>
                              {finding.severity}
                            </span>
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{finding.cvss}</td>
                          <td className="py-3 pr-4 text-gray-400">{finding.status}</td>
                          <td className="py-3 pr-4">
                            <Button
                              variant="ghost"
                              onClick={() => setExpandedFinding(expandedFinding === index ? null : index)}
                            >
                              {expandedFinding === index ? 'Hide' : 'Details'}
                            </Button>
                          </td>
                        </tr>
                        {expandedFinding === index && (
                          <tr>
                            <td colSpan={6} className="py-4">
                              <div className="p-4 bg-gray-900/70 rounded-lg border border-gray-700 space-y-3">
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-400 mb-1">Description</h5>
                                  <p className="text-sm text-gray-300">{finding.description}</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-400 mb-1">Impact</h5>
                                  <p className="text-sm text-gray-300">{finding.impact}</p>
                                </div>
                                <div>
                                  <h5 className="text-xs font-semibold text-gray-400 mb-1">Remediation</h5>
                                  <p className="text-sm text-gray-300">{finding.remediation}</p>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generate Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ReportGenerator 
                data={{
                  summary: { 
                    critical: recentFindings.filter(f => f.severity === 'Critical').length,
                    high: recentFindings.filter(f => f.severity === 'High').length,
                    medium: recentFindings.filter(f => f.severity === 'Medium').length,
                    low: recentFindings.filter(f => f.severity === 'Low').length,
                    total: recentFindings.length
                  },
                  vulnerabilities: recentFindings
                }}
                title="Offensive Security Assessment Report"
                type="offensive"
              />
            </div>
          </CardContent>
        </Card>
        </AuthGate>
      </div>
    </div>
  );
}
