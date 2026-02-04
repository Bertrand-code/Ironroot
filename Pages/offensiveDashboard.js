import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, AlertCircle, Zap, FileText, ChevronRight, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReportGenerator from '../components/Reports/ReportGenerator';
import NotificationBell from '../components/Notifications/NotificationBell';

export default function OffensiveDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedFinding, setExpandedFinding] = useState(null);
  const [expandedEngagement, setExpandedEngagement] = useState(null);

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
              <CardTitle className="text-white">Active Engagements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {engagements.map((engagement, index) => (
                  <div key={index}>
                    <div 
                      className="p-4 bg-gray-900/50 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all cursor-pointer"
                      onClick={() => setExpandedEngagement(expandedEngagement === index ? null : index)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-white mb-1">{engagement.name}</h4>
                          <p className="text-sm text-gray-400">{engagement.target}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            engagement.status === 'In Progress' ? 'bg-blue-500/10 text-blue-500' :
                            engagement.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                            engagement.status === 'Active' ? 'bg-yellow-500/10 text-yellow-500' :
                            'bg-purple-500/10 text-purple-500'
                          }`}>
                            {engagement.status}
                          </span>
                          {expandedEngagement === index ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">
                          Findings: <span className="text-white font-medium">{engagement.findings}</span>
                        </span>
                        <span className="text-gray-400">
                          Critical: <span className="text-red-500 font-medium">{engagement.critical}</span>
                        </span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedEngagement === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-4 bg-gray-900/70 rounded-lg border border-gray-700 space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-1">Start Date</h5>
                                <p className="text-sm text-gray-300">{engagement.startDate}</p>
                              </div>
                              <div>
                                <h5 className="text-xs font-semibold text-gray-400 mb-1">Timeline</h5>
                                <p className="text-sm text-gray-300">{engagement.timeline}</p>
                              </div>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-gray-400 mb-1">Scope</h5>
                              <p className="text-sm text-gray-300">{engagement.scope}</p>
                            </div>
                            <div>
                              <h5 className="text-xs font-semibold text-gray-400 mb-1">Methodology</h5>
                              <p className="text-sm text-gray-300">{engagement.methodology}</p>
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentFindings.map((finding, index) => (
                  <div key={index}>
                    <div 
                      className={`p-4 rounded-lg border ${getSeverityColor(finding.severity)} cursor-pointer hover:opacity-80 transition-opacity`}
                      onClick={() => setExpandedFinding(expandedFinding === index ? null : index)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-mono text-gray-500">{finding.id}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(finding.severity)}`}>
                            {finding.severity}
                          </span>
                          {expandedFinding === index ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <h4 className="text-sm font-medium text-white mb-2">{finding.title}</h4>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">CVSS: <span className="text-white font-medium">{finding.cvss}</span></span>
                        <span className="text-gray-500">{finding.status}</span>
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedFinding === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-2 p-4 bg-gray-900/70 rounded-lg border border-gray-700 space-y-3">
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
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
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
      </div>
    </div>
  );
}
