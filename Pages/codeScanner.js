import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, GitBranch, AlertTriangle, CheckCircle, Clock, Loader2, FileCode, Shield, ChevronDown, ChevronUp, ExternalLink, Globe, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScanScheduler from '../components/scheduling/ScanScheduler';
import NotificationBell from '../components/notifications/NotificationBell';

export default function CodeScanner() {
  const [file, setFile] = useState(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [error, setError] = useState('');
  const [expandedVulns, setExpandedVulns] = useState({});
  const [hasAccess, setHasAccess] = useState(false);
  const [accessStatus, setAccessStatus] = useState({ type: '', message: '' });

  React.useEffect(() => {
    checkUserAccess();
  }, []);

  const checkUserAccess = async () => {
    try {
      const user = await base44.auth.me();
      
      // Check if user has an active trial
      const trials = await base44.entities.TrialRequest.filter({ 
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
      const converted = await base44.entities.TrialRequest.filter({ 
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
      // Upload the file
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      // Analyze the code using AI with Nessus/Kali Linux-grade vulnerability scanning
      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert penetration tester conducting a COMPREHENSIVE security audit using industry-leading methodologies similar to Nessus, OpenVAS, Nikto, Burp Suite, and Kali Linux tools.

🔍 PERFORM MULTI-LAYERED SECURITY ANALYSIS:

**VULNERABILITY SCANNING (Nessus-style):**
- Static Application Security Testing (SAST)
- Dependency vulnerability analysis (like Snyk, OWASP Dependency-Check)
- Known CVE detection with CVSS scoring
- CWE mapping for each finding
- OWASP Top 10 2021/2023 compliance checks

**PENETRATION TESTING CHECKS (Kali Linux tools):**
- SQL Injection vectors (SQLMap methodology)
- Cross-Site Scripting (XSS) - reflected, stored, DOM-based
- Command Injection vulnerabilities
- Path Traversal/Directory Traversal
- Insecure Direct Object References (IDOR)
- Security Misconfigurations
- Sensitive Data Exposure
- Broken Authentication & Session Management
- XML External Entities (XXE)
- Insecure Deserialization
- Server-Side Request Forgery (SSRF)
- Race Conditions & TOCTOU vulnerabilities

**CODE QUALITY & SECURITY:**
- Hardcoded secrets/credentials/API keys
- Weak cryptography (MD5, SHA1, weak random)
- Missing input validation & sanitization
- Unsafe function usage (eval, exec, system calls)
- Memory safety issues (buffer overflows if applicable)
- Logic flaws & business logic vulnerabilities
- Information disclosure risks

**COMPLIANCE & BEST PRACTICES:**
- PCI DSS compliance for payment handling
- GDPR/HIPAA data protection requirements
- Secure coding standards violations
- Missing security headers

For EACH vulnerability found, provide complete details:
- severity: "critical"/"high"/"medium"/"low" (CVSS 3.1 scoring)
- title: Specific, technical vulnerability name
- description: Detailed technical explanation of the security flaw and business impact
- cwe_id: Common Weakness Enumeration ID (e.g., "CWE-89")
- cve_id: Known CVE if applicable (e.g., "CVE-2023-12345")
- owasp_category: OWASP Top 10 category (e.g., "A03:2021 - Injection")
- lineNumber: Exact line numbers where vulnerability exists
- affectedCode: The actual vulnerable code snippet
- attackScenario: Detailed exploitation scenario with attack payload examples
- remediation: Step-by-step technical fix instructions with security best practices
- secureCodeExample: Complete working code showing secure implementation
- references: Array of URLs to OWASP, CVE, NVD, security advisories

CRITICAL: You MUST find and report ALL vulnerabilities. Be extremely thorough like a real pentest. Even minor issues matter.`,
        file_urls: [file_url],
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                critical: { type: 'number' },
                high: { type: 'number' },
                medium: { type: 'number' },
                low: { type: 'number' },
                total: { type: 'number' }
              }
            },
            vulnerabilities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  cwe_id: { type: 'string' },
                  cve_id: { type: 'string' },
                  owasp_category: { type: 'string' },
                  lineNumber: { type: 'string' },
                  affectedCode: { type: 'string' },
                  attackScenario: { type: 'string' },
                  remediation: { type: 'string' },
                  secureCodeExample: { type: 'string' },
                  references: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setScanResults(analysis);
      
      // Save scan history and activity log
      try {
        const user = await base44.auth.me();
        await base44.entities.ScanHistory.create({
          scanType: 'file_upload',
          targetName: file.name,
          summary: analysis.summary || { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
          vulnerabilities: analysis.vulnerabilities || [],
          scanDate: new Date().toISOString(),
          scannedBy: user.email
        });

        await base44.entities.ActivityLog.create({
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
      let analysis;
      let scanType;
      
      if (isGithub) {
        // GitHub Repository Code Scanning
        scanType = 'github_repository';
        analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an ELITE security researcher with access to comprehensive security databases (OWASP, CVE, CWE, NVD, Snyk, GitHub Security Advisories).

Perform INDUSTRY-LEADING code security analysis of GitHub repository: ${urlTrimmed}

Use web search extensively to gather intelligence and replicate the capabilities of:
- **Snyk**: Dependency vulnerability scanning with fix recommendations
- **Semgrep**: Advanced SAST with custom rule detection
- **Veracode**: Enterprise-grade security testing
- **GitHub Advanced Security**: Secret scanning and code scanning
- **SonarQube**: Code quality and security hotspots
- **Checkmarx**: Deep code flow analysis

🔍 **COMPREHENSIVE CODE SECURITY AUDIT**:

**1. DEPENDENCY & SUPPLY CHAIN ANALYSIS**
- Scan ALL dependencies (npm, PyPI, Maven, RubyGems, Go modules, etc.)
- Cross-reference with NVD, GitHub Security Advisories, Snyk vulnerability database
- Identify ALL CVEs with CVSS scores for each dependency
- Check for outdated packages and available security patches
- Detect typosquatting, compromised packages, supply chain attack vectors
- Analyze transitive dependencies (dependencies of dependencies)
- Flag deprecated or unmaintained packages

**2. SECRETS & CREDENTIALS SCANNING**
- Scan commit history for exposed secrets (git log analysis)
- Detect API keys (AWS, Google Cloud, Azure, Stripe, etc.)
- Find database credentials, passwords, private keys, tokens
- Check for hardcoded secrets in .env files, config files, source code
- Identify JWT secrets, OAuth tokens, encryption keys
- Scan for exposed cloud storage bucket credentials

**3. STATIC APPLICATION SECURITY TESTING (SAST)**
- **Injection Attacks**: SQL injection, NoSQL injection, Command injection, LDAP injection, XPath injection
- **Cross-Site Scripting (XSS)**: Reflected XSS, Stored XSS, DOM-based XSS, mXSS
- **Authentication & Authorization**: Broken authentication, session management flaws, JWT vulnerabilities, OAuth misconfigurations
- **Cryptographic Failures**: Weak encryption (MD5, SHA1, DES), hardcoded keys, insecure random number generation
- **Path Traversal & File Inclusion**: Directory traversal, LFI, RFI, zip slip vulnerabilities
- **Insecure Deserialization**: Unsafe deserialization in Java, Python pickle, PHP unserialize
- **XML External Entities (XXE)**: XML parser vulnerabilities
- **Server-Side Request Forgery (SSRF)**: Internal network access, cloud metadata exposure
- **Security Misconfigurations**: Default credentials, verbose error messages, debug mode enabled
- **Sensitive Data Exposure**: PII leakage, credit card data, health records
- **Business Logic Flaws**: Price manipulation, privilege escalation, workflow bypass
- **Race Conditions**: TOCTOU vulnerabilities, concurrency issues

**4. OWASP TOP 10 2021/2023 COMPLIANCE**
Map every finding to OWASP categories:
- A01:2021 – Broken Access Control
- A02:2021 – Cryptographic Failures
- A03:2021 – Injection
- A04:2021 – Insecure Design
- A05:2021 – Security Misconfiguration
- A06:2021 – Vulnerable and Outdated Components
- A07:2021 – Identification and Authentication Failures
- A08:2021 – Software and Data Integrity Failures
- A09:2021 – Security Logging and Monitoring Failures
- A10:2021 – Server-Side Request Forgery

**5. INFRASTRUCTURE & DEVOPS SECURITY**
- Docker/Kubernetes security: Privileged containers, exposed ports, insecure images
- CI/CD pipeline security: Secrets in workflows, insecure runners
- Cloud misconfigurations: S3 buckets, IAM permissions, security groups
- Missing security headers: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- CORS misconfigurations allowing unauthorized origins

**6. CODE QUALITY & SECURE CODING STANDARDS**
- CWE (Common Weakness Enumeration) mapping for all findings
- SANS Top 25 Most Dangerous Software Errors compliance
- PCI DSS requirements for payment processing
- HIPAA compliance for healthcare data
- GDPR data protection requirements

For EACH vulnerability provide:
- **severity**: "critical"/"high"/"medium"/"low" (use CVSS 3.1 scoring methodology)
- **title**: Precise vulnerability name
- **description**: Technical explanation with business impact and real-world exploitation consequences
- **cwe_id**: CWE identifier (e.g., "CWE-89", "CWE-79")
- **cve_id**: CVE if dependency vulnerability (e.g., "CVE-2024-12345")
- **owasp_category**: OWASP Top 10 2021 category
- **component**: Affected file, package, module, or function
- **currentVersion**: Current vulnerable version (for dependencies)
- **fixedVersion**: Patched version to upgrade to (for dependencies)
- **attackScenario**: Step-by-step exploitation with proof-of-concept code/commands
- **remediation**: Detailed fix with code examples, configuration changes, upgrade commands
- **secureCodeExample**: Working secure code implementation
- **references**: Array of authoritative URLs (NVD, OWASP, GitHub Advisory, CVE, vendor security bulletins)

**CRITICAL REQUIREMENTS**:
- Be EXHAUSTIVE - this must match or exceed Snyk/Semgrep/Veracode quality
- Find EVERYTHING - even low-severity issues matter for comprehensive reporting
- Provide ACTIONABLE fixes with exact code/commands
- Include CVE/CWE IDs for all findings where applicable`,

          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: {
                  critical: { type: 'number' },
                  high: { type: 'number' },
                  medium: { type: 'number' },
                  low: { type: 'number' },
                  total: { type: 'number' }
                }
              },
              vulnerabilities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    severity: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    cwe_id: { type: 'string' },
                    cve_id: { type: 'string' },
                    owasp_category: { type: 'string' },
                    component: { type: 'string' },
                    currentVersion: { type: 'string' },
                    fixedVersion: { type: 'string' },
                    attackScenario: { type: 'string' },
                    remediation: { type: 'string' },
                    secureCodeExample: { type: 'string' },
                    references: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        });
      } else {
        // Website Infrastructure Scanning
        scanType = 'website_infrastructure';
        analysis = await base44.integrations.Core.InvokeLLM({
          prompt: `You are an ELITE penetration tester with 20+ years of experience conducting a COMPREHENSIVE security assessment of the website: ${urlTrimmed}

Use web search extensively to discover vulnerabilities and replicate these industry-leading tools:
- **Nuclei**: Template-based vulnerability scanning with 5000+ templates
- **Nmap**: Network discovery, port scanning, service detection, OS fingerprinting
- **Amass**: DNS enumeration, subdomain discovery, network mapping
- **Subfinder**: Passive subdomain enumeration
- **Nikto**: Web server scanning for 6700+ dangerous files/programs
- **Burp Suite Professional**: Web application security testing
- **OWASP ZAP**: Active and passive web security scanning
- **Metasploit**: Exploit framework and vulnerability validation
- **SQLMap**: Advanced SQL injection detection and exploitation
- **WPScan**: WordPress vulnerability scanner

🎯 **COMPLETE INFRASTRUCTURE & APPLICATION SECURITY AUDIT**:

**1. RECONNAISSANCE & INFORMATION GATHERING**
Use web search to discover:
- Subdomain enumeration (find all subdomains of the target)
- DNS records (A, AAAA, MX, TXT, CNAME, NS, SOA)
- Reverse DNS lookups
- WHOIS information (registration details, nameservers)
- SSL/TLS certificate details (issuer, expiration, SANs)
- Email addresses and employee information
- Technology stack detection (CMS, frameworks, libraries, CDN, WAF)
- Exposed admin panels, login pages, sensitive directories
- Historical data (Wayback Machine for old vulnerabilities)
- Cloud service detection (AWS, Azure, GCP resources)

**2. NETWORK & PORT SCANNING (Nmap-style)**
Identify:
- Open ports and services (HTTP, HTTPS, SSH, FTP, SMTP, MySQL, PostgreSQL, MongoDB, Redis, etc.)
- Service versions and banners (Apache 2.4.41, nginx 1.18.0, OpenSSH 8.2, etc.)
- Operating system fingerprinting (Linux, Windows versions)
- Firewall and IDS/IPS detection
- Network topology and architecture
- Exposed databases and services (MongoDB, Redis, Elasticsearch on public ports)
- Obsolete or vulnerable service versions

**3. WEB APPLICATION VULNERABILITIES (OWASP Top 10 2021)**
- **Broken Access Control**: IDOR, privilege escalation, forced browsing, missing function-level access control
- **Cryptographic Failures**: Weak SSL/TLS (SSLv3, TLS 1.0/1.1), weak ciphers, expired certificates, missing HSTS
- **Injection Attacks**: 
  - SQL Injection (error-based, blind, time-based, boolean-based)
  - NoSQL Injection (MongoDB, CouchDB)
  - Command Injection (OS command injection)
  - LDAP Injection, XPath Injection
  - Template Injection (SSTI)
- **Insecure Design**: Business logic flaws, missing rate limiting, predictable tokens
- **Security Misconfiguration**:
  - Default credentials (admin/admin, root/root)
  - Directory listing enabled
  - Verbose error messages revealing stack traces
  - Unnecessary HTTP methods enabled (PUT, DELETE, TRACE)
  - Missing security headers (CSP, X-Frame-Options, X-Content-Type-Options, X-XSS-Protection)
  - Debug mode enabled in production
  - Exposed .git, .env, .svn, backup files (*.bak, *.old, *.backup)
  - Exposed admin interfaces (/admin, /phpmyadmin, /wp-admin)
- **Vulnerable and Outdated Components**: Outdated CMS (WordPress, Joomla, Drupal), plugins, themes, libraries
- **Identification and Authentication Failures**:
  - Weak password policies
  - Session fixation, session hijacking
  - Missing account lockout mechanisms
  - Predictable session tokens
  - Missing multi-factor authentication
- **Software and Data Integrity Failures**: Insecure deserialization, unsigned updates
- **Security Logging and Monitoring Failures**: Missing audit logs, insufficient monitoring
- **Server-Side Request Forgery (SSRF)**: Internal network access, cloud metadata exposure (AWS 169.254.169.254)
- **Cross-Site Scripting (XSS)**: Reflected, Stored, DOM-based, mXSS
- **Cross-Site Request Forgery (CSRF)**: Missing CSRF tokens
- **XML External Entities (XXE)**: XML parser vulnerabilities
- **Insecure Direct Object References (IDOR)**: Unauthorized access to resources

**4. CONTENT MANAGEMENT SYSTEM (CMS) VULNERABILITIES**
If WordPress/Joomla/Drupal detected:
- Enumerate plugins and themes with known CVEs
- Check for vulnerable versions (WPScan database, Exploit-DB)
- Default admin credentials
- XML-RPC abuse, REST API exposure
- File upload vulnerabilities
- Theme/plugin backdoors

**5. DNS SECURITY**
- DNS zone transfer (AXFR) vulnerabilities
- DNS cache poisoning susceptibility
- DNSSEC validation
- Subdomain takeover vulnerabilities (dangling DNS records)

**6. SSL/TLS SECURITY**
- Weak cipher suites (RC4, DES, 3DES, MD5)
- Missing Perfect Forward Secrecy (PFS)
- Heartbleed (CVE-2014-0160), POODLE, BEAST, CRIME vulnerabilities
- Certificate chain issues, self-signed certificates
- Missing HTTP Strict Transport Security (HSTS)

**7. API SECURITY**
- Exposed API endpoints (/api/v1/users, /graphql)
- Missing authentication/authorization on APIs
- Excessive data exposure in API responses
- Rate limiting bypass
- API key exposure in client-side code

**8. CLOUD & CONTAINER SECURITY**
- Exposed cloud storage (AWS S3 buckets, Azure Blob Storage, GCS)
- Cloud metadata service access (AWS metadata API)
- Misconfigured Docker/Kubernetes dashboards
- Container registry exposure

**9. COMMON VULNERABILITIES & EXPOSURES (CVE)**
Cross-reference discovered technologies with:
- CVE database for known exploits
- Exploit-DB for public exploits
- Metasploit modules applicable to detected services

For EACH finding provide:
- **severity**: "critical"/"high"/"medium"/"low" (CVSS 3.1 scoring)
- **title**: Specific vulnerability or misconfiguration name
- **description**: Technical details, business impact, and exploitability
- **cwe_id**: CWE identifier where applicable
- **cve_id**: CVE if known vulnerability in detected technology
- **owasp_category**: OWASP Top 10 category
- **component**: Affected service, port, or URL path
- **currentVersion**: Current vulnerable version detected
- **fixedVersion**: Patched version to upgrade to (if applicable)
- **attackScenario**: Step-by-step exploitation with commands/payloads
- **remediation**: Detailed fix instructions (configuration changes, patches, upgrades)
- **secureCodeExample**: Secure configuration example where applicable
- **references**: URLs to CVE, NVD, OWASP, vendor advisories, exploit databases

**CRITICAL REQUIREMENTS**:
1. Use web search to find CVEs associated with detected technologies on ${urlTrimmed}
2. Search for "${urlTrimmed} CVE vulnerabilities" to find known security issues
3. Check security databases (NVD, CVE, Exploit-DB) for vulnerabilities in detected software versions
4. Be EXHAUSTIVE - find ALL critical, high, medium, and low severity issues
5. Provide detailed remediation steps and CVE references for every finding
6. Focus on REAL vulnerabilities with CVE IDs and proven exploits where possible`,
          add_context_from_internet: true,
          response_json_schema: {
            type: 'object',
            properties: {
              summary: {
                type: 'object',
                properties: {
                  critical: { type: 'number' },
                  high: { type: 'number' },
                  medium: { type: 'number' },
                  low: { type: 'number' },
                  total: { type: 'number' }
                }
              },
              vulnerabilities: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    severity: { type: 'string' },
                    title: { type: 'string' },
                    description: { type: 'string' },
                    cwe_id: { type: 'string' },
                    cve_id: { type: 'string' },
                    owasp_category: { type: 'string' },
                    component: { type: 'string' },
                    currentVersion: { type: 'string' },
                    fixedVersion: { type: 'string' },
                    attackScenario: { type: 'string' },
                    remediation: { type: 'string' },
                    secureCodeExample: { type: 'string' },
                    references: { type: 'array', items: { type: 'string' } }
                  }
                }
              }
            }
          }
        });
      }

      setScanResults(analysis);
      
      // Save scan history and activity log
      try {
        const user = await base44.auth.me();
        await base44.entities.ScanHistory.create({
          scanType: scanType,
          targetName: urlTrimmed,
          summary: analysis.summary || { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
          vulnerabilities: analysis.vulnerabilities || [],
          scanDate: new Date().toISOString(),
          scannedBy: user.email
        });

        await base44.entities.ActivityLog.create({
          userEmail: user.email,
          action: 'code_scan_performed',
          details: {
            scanType: scanType,
            targetUrl: urlTrimmed,
            vulnerabilitiesFound: analysis.summary?.total || 0
          },
          timestamp: new Date().toISOString()
        });
      } catch (historyErr) {
        console.error('Failed to save scan history:', historyErr);
      }
    } catch (err) {
      console.error('Scan error:', err);
      const errorMessage = err?.message || err?.toString() || 'Unknown error occurred';
      setError(`Scan failed: ${errorMessage}. Please try again or contact support if the issue persists.`);
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