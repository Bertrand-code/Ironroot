import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AuthGate from '@/components/AuthGate';

const intelLibrary = [
  {
    id: 'ai-supply-chain',
    label: 'AI Supply Chain Risks',
    threatLevel: 'high',
    summary:
      'Model supply chains are being targeted through dependency poisoning, prompt injection, and malicious plugins. Primary risk sits in build pipelines and third-party model integrations.',
    cves: [
      { id: 'CVE-2025-1183', cvss: 8.2, focus: 'Dependency poisoning in build pipelines' },
      { id: 'CVE-2025-3021', cvss: 7.5, focus: 'LLM agent tool misuse' },
    ],
    tactics: ['Initial Access', 'Persistence', 'Credential Access', 'Execution'],
    iocs: ['Suspicious package names', 'Unsigned model artifacts', 'Unexpected outbound API calls'],
    remediation:
      'Pin dependencies, enforce SBOM verification, isolate model execution, and enforce tool allowlists with egress control.',
  },
  {
    id: 'api-abuse',
    label: 'API Abuse & Token Theft',
    threatLevel: 'critical',
    summary:
      'API tokens are being harvested through exposed logs, misconfigured gateways, and weak OAuth flows. Attackers move laterally via internal APIs once tokens are acquired.',
    cves: [
      { id: 'CVE-2024-9912', cvss: 9.1, focus: 'OAuth token leakage' },
      { id: 'CVE-2024-8810', cvss: 8.7, focus: 'Gateway auth bypass' },
    ],
    tactics: ['Credential Access', 'Lateral Movement', 'Exfiltration'],
    iocs: ['Token reuse from unusual geos', 'Burst traffic on admin endpoints', 'Unauthorized scope escalation'],
    remediation:
      'Rotate secrets, enforce OAuth PKCE, apply geo/IP allowlists, and deploy API anomaly detection with rate limits.',
  },
  {
    id: 'ransomware',
    label: 'Ransomware Targeting Healthcare',
    threatLevel: 'high',
    summary:
      'Ransomware groups are leveraging exposed RDP and phishing to gain initial access, then rapidly encrypting high-value systems.',
    cves: [
      { id: 'CVE-2024-6731', cvss: 7.8, focus: 'Remote access gateway weaknesses' },
    ],
    tactics: ['Initial Access', 'Impact', 'Command and Control'],
    iocs: ['Unusual RDP logins', 'Mass file encryption events', 'Shadow copy deletions'],
    remediation:
      'Disable public RDP, enforce MFA, segment critical systems, and test rapid restore playbooks weekly.',
  },
];

const cveIndex = [
  {
    id: 'CVE-2025-1183',
    title: 'Pipeline dependency poisoning',
    cvss: 8.2,
    description:
      'Malicious dependency injection in CI/CD supply chains allowing remote code execution during builds.',
    owasp: 'A08:2021 - Software and Data Integrity Failures',
  },
  {
    id: 'CVE-2024-9912',
    title: 'OAuth token leakage via logs',
    cvss: 9.1,
    description:
      'Access tokens exposed in debug logs enabling session replay and account compromise.',
    owasp: 'A02:2021 - Cryptographic Failures',
  },
  {
    id: 'CVE-2024-8810',
    title: 'Gateway authentication bypass',
    cvss: 8.7,
    description:
      'Improper authorization checks in API gateway middleware allow bypass of auth checks.',
    owasp: 'A01:2021 - Broken Access Control',
  },
  {
    id: 'CVE-2024-6731',
    title: 'Remote access gateway exposure',
    cvss: 7.8,
    description:
      'Misconfigured remote access services allow unauthorized access and lateral movement.',
    owasp: 'A05:2021 - Security Misconfiguration',
  },
  {
    id: 'CVE-2025-3021',
    title: 'LLM agent tool misuse',
    cvss: 7.5,
    description:
      'Agent tool permission misconfiguration allows data exfiltration through third-party tools.',
    owasp: 'A04:2021 - Insecure Design',
  },
];

const owaspIndex = [
  {
    id: 'A01:2021',
    name: 'Broken Access Control',
    summary: 'Enforce least privilege, server-side authorization, and deny-by-default policies.',
  },
  {
    id: 'A02:2021',
    name: 'Cryptographic Failures',
    summary: 'Protect sensitive data with strong encryption, secrets management, and key rotation.',
  },
  {
    id: 'A03:2021',
    name: 'Injection',
    summary: 'Use parameterized queries, input validation, and context-aware output encoding.',
  },
  {
    id: 'A04:2021',
    name: 'Insecure Design',
    summary: 'Threat model early, apply secure design patterns, and enforce security requirements.',
  },
  {
    id: 'A05:2021',
    name: 'Security Misconfiguration',
    summary: 'Harden defaults, remove unused services, and apply secure headers.',
  },
  {
    id: 'A06:2021',
    name: 'Vulnerable and Outdated Components',
    summary: 'Maintain SBOMs, patch regularly, and monitor for dependency risks.',
  },
  {
    id: 'A07:2021',
    name: 'Identification and Authentication Failures',
    summary: 'Enforce MFA, strong passwords, and rate limiting for login endpoints.',
  },
  {
    id: 'A08:2021',
    name: 'Software and Data Integrity Failures',
    summary: 'Verify build artifacts, sign releases, and lock CI/CD pipelines.',
  },
  {
    id: 'A09:2021',
    name: 'Security Logging and Monitoring Failures',
    summary: 'Centralize logging, alert on anomalies, and test incident response.',
  },
  {
    id: 'A10:2021',
    name: 'Server-Side Request Forgery (SSRF)',
    summary: 'Validate outbound requests, segment networks, and enforce allowlists.',
  },
];

const threatPill = {
  critical: 'badge badge--warning',
  high: 'badge badge--warning',
  medium: 'badge',
  low: 'badge',
};

const intelSignals = [
  {
    title: 'Exploit Maturity',
    value: 'High',
    detail: 'Active exploitation observed in the last 7 days',
  },
  {
    title: 'Attack Surface Exposure',
    value: 'Medium',
    detail: '3 internet-facing assets require hardening',
  },
  {
    title: 'Credential Leakage',
    value: 'Low',
    detail: 'No confirmed leaked tokens in the last 30 days',
  },
];

const watchlist = [
  {
    title: 'Critical API Gateway Patch',
    severity: 'critical',
    owner: 'Platform Team',
    eta: '48 hrs',
  },
  {
    title: 'Rotate Third-Party OAuth Secrets',
    severity: 'high',
    owner: 'Security Ops',
    eta: '72 hrs',
  },
  {
    title: 'Deploy IOC Monitoring to SIEM',
    severity: 'medium',
    owner: 'SOC',
    eta: '1 week',
  },
];

export default function ThreatIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState(intelLibrary[0].id);

  const filteredIntel = useMemo(() => {
    if (!searchQuery.trim()) return intelLibrary;
    const query = searchQuery.toLowerCase();
    return intelLibrary.filter((item) =>
      [item.label, item.summary, item.remediation, ...(item.cves || []).map((cve) => cve.id)]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [searchQuery]);

  const cveResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return cveIndex.filter((cve) =>
      [cve.id, cve.title, cve.description, cve.owasp].join(' ').toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const owaspResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    return owaspIndex.filter((item) =>
      [item.id, item.name, item.summary].join(' ').toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const selectedIntel = filteredIntel.find((item) => item.id === selectedId) || filteredIntel[0];

  return (
    <div className="section">
      <div className="container">
        <div className="section-header">
          <h1 className="title-lg" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Radar className="brand__logo" />
            Threat Intelligence Command Center
          </h1>
          <p className="text-lead">
            Centralize external intelligence, map it to your environment, and push prioritized defensive actions in minutes.
          </p>
        </div>

        <div className="grid grid-3" style={{ marginBottom: '24px' }}>
          {intelSignals.map((signal) => (
            <div key={signal.title} className="card card--glass">
              <div className="badge">{signal.title}</div>
              <h3 className="card__title" style={{ marginTop: '10px' }}>{signal.value}</h3>
              <p className="card__meta">{signal.detail}</p>
            </div>
          ))}
        </div>

        <Card className="card card--glass" style={{ marginBottom: '24px' }}>
          <CardContent>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Input
                placeholder="Search threat topics, CVEs, or campaigns"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button variant="secondary" onClick={() => setSearchQuery('')}
              >
                <Search size={16} />
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {searchQuery.trim() && (
          <div className="grid grid-2" style={{ marginBottom: '24px' }}>
            <Card className="card card--glass">
              <CardHeader>
                <CardTitle>CVE Lookup</CardTitle>
              </CardHeader>
              <CardContent>
                {cveResults.length ? (
                  <div className="grid" style={{ gap: '12px' }}>
                    {cveResults.map((cve) => (
                      <div key={cve.id} className="card card--glass" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{cve.id}</strong>
                          <span className="badge">CVSS {cve.cvss}</span>
                        </div>
                        <p className="card__meta" style={{ marginTop: '6px' }}>{cve.title}</p>
                        <p className="card__meta">{cve.description}</p>
                        <div className="badge" style={{ marginTop: '8px' }}>{cve.owasp}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card__meta">No CVE matches found.</div>
                )}
              </CardContent>
            </Card>
            <Card className="card card--glass">
              <CardHeader>
                <CardTitle>OWASP Top 10</CardTitle>
              </CardHeader>
              <CardContent>
                {owaspResults.length ? (
                  <div className="grid" style={{ gap: '10px' }}>
                    {owaspResults.map((item) => (
                      <div key={item.id} className="card card--glass" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <strong>{item.id}</strong>
                          <span className="badge">{item.name}</span>
                        </div>
                        <p className="card__meta" style={{ marginTop: '6px' }}>{item.summary}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="card__meta">No OWASP matches found.</div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

          <div className="grid grid-2" style={{ alignItems: 'start' }}>
            <div className="card card--glass">
              <CardHeader>
                <CardTitle>Active Intelligence Streams</CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid" style={{ gap: '12px' }}>
                {filteredIntel.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedId(item.id)}
                    className="card card--glass"
                    style={{ textAlign: 'left', cursor: 'pointer', borderColor: selectedId === item.id ? 'rgba(255,77,77,0.6)' : undefined }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span className="card__title">{item.label}</span>
                      <span className={threatPill[item.threatLevel]}>{item.threatLevel.toUpperCase()}</span>
                    </div>
                    <p className="card__meta" style={{ marginTop: '6px' }}>{item.summary}</p>
                  </button>
                ))}
                {filteredIntel.length === 0 && (
                  <div className="card__meta">No matching intelligence streams.</div>
                )}
              </div>
            </CardContent>
          </div>

          <AuthGate
            title="Sign in to view operational briefs"
            description="Threat actor profiles, IOC intelligence, and response playbooks require an authenticated account."
            plans={['paid']}
          >
            <AnimatePresence mode="wait">
              {selectedIntel && (
                <motion.div
                  key={selectedIntel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="card card--glass"
                >
                  <CardHeader>
                    <CardTitle>Operational Brief</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid" style={{ gap: '16px' }}>
                      <div>
                        <div className="badge">Executive Summary</div>
                        <p className="card__meta" style={{ marginTop: '8px' }}>{selectedIntel.summary}</p>
                      </div>
                      <div>
                        <div className="badge">Key CVEs</div>
                        <div className="grid" style={{ gap: '10px', marginTop: '10px' }}>
                          {selectedIntel.cves.map((cve) => (
                            <div key={cve.id} className="card card--glass" style={{ padding: '12px' }}>
                              <strong>{cve.id}</strong>
                              <p className="card__meta">CVSS {cve.cvss} · {cve.focus}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="badge">MITRE Tactics</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                          {selectedIntel.tactics.map((tactic) => (
                            <span key={tactic} className="badge">{tactic}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="badge">Indicators of Concern</div>
                        <ul className="grid" style={{ gap: '6px', marginTop: '8px' }}>
                          {selectedIntel.iocs.map((ioc) => (
                            <li key={ioc} className="card__meta">• {ioc}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="badge">Recommended Response</div>
                        <p className="card__meta" style={{ marginTop: '8px' }}>{selectedIntel.remediation}</p>
                      </div>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <Button>Push to SOC Queue</Button>
                        <Button variant="ghost" onClick={() => (window.location.href = '/threatReport')}>Export Brief</Button>
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </AuthGate>
        </div>

        <div className="section" style={{ paddingBottom: 0 }}>
          <div className="section-header">
            <h2 className="title-lg">Actionable Programs</h2>
            <p className="text-lead">
              Drive execution with targeted programs that align offensive testing, defensive monitoring, and compliance needs.
            </p>
          </div>
          <AuthGate
            title="Sign in to manage response programs"
            description="IOC monitoring, response watchlists, and exposure mapping are available after login."
            plans={['paid']}
          >
            <Tabs defaultValue="watchlist">
              <TabsList>
                <TabsTrigger value="watchlist">Response Watchlist</TabsTrigger>
                <TabsTrigger value="ioc">IOC Monitoring</TabsTrigger>
                <TabsTrigger value="exposure">Exposure Map</TabsTrigger>
              </TabsList>
              <TabsContent value="watchlist">
                <div className="grid grid-3" style={{ marginTop: '16px' }}>
                  {watchlist.map((item) => (
                    <div key={item.title} className="card card--glass">
                      <div className="badge">{item.severity.toUpperCase()}</div>
                      <h3 className="card__title" style={{ marginTop: '10px' }}>{item.title}</h3>
                      <p className="card__meta">Owner: {item.owner}</p>
                      <p className="card__meta">ETA: {item.eta}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              <TabsContent value="ioc">
                <div className="grid grid-2" style={{ marginTop: '16px' }}>
                  <div className="card card--glass">
                    <CardTitle>IOC Feeds</CardTitle>
                    <ul className="grid" style={{ gap: '8px', marginTop: '10px' }}>
                      {['Suspicious IP clusters', 'Malicious domains', 'File hash alerts'].map((item) => (
                        <li key={item} className="card__meta">• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="card card--glass">
                    <CardTitle>Detection Coverage</CardTitle>
                    <p className="card__meta" style={{ marginTop: '8px' }}>
                      94% of high-risk IOCs are mapped to SIEM rules and endpoint policies.
                    </p>
                    <Button style={{ marginTop: '12px' }} variant="secondary">
                      Sync to SIEM
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="exposure">
                <div className="grid grid-3" style={{ marginTop: '16px' }}>
                  {[
                    { label: 'Internet-Facing Assets', value: '42' },
                    { label: 'Critical Open Ports', value: '6' },
                    { label: 'Shadow IT Services', value: '11' },
                  ].map((item) => (
                    <div key={item.label} className="card card--glass">
                      <div className="badge">Exposure</div>
                      <h3 className="card__title" style={{ marginTop: '10px' }}>{item.value}</h3>
                      <p className="card__meta">{item.label}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </AuthGate>
        </div>
      </div>
    </div>
  );
}
