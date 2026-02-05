import React from 'react';
import { Button } from '@/components/ui/button';
import AuthGate from '@/components/AuthGate';

export default function ThreatReport() {
  return (
    <AuthGate
      title="Sign in to export reports"
      description="PDF-ready threat reports are available to authenticated users."
      plans={['paid']}
      feature="reportExports"
    >
      <div className="print-page">
        <div className="print-toolbar">
          <Button onClick={() => window.print()}>Print / Save PDF</Button>
          <Button variant="ghost" onClick={() => (window.location.href = '/threatIntelligence')}>Back</Button>
        </div>
        <div className="print-sheet">
        <header className="print-header">
          <div>
            <h1>Ironroot Threat Intelligence Report</h1>
            <p>Prepared for executive and security leadership</p>
          </div>
          <div>
            <span className="print-badge">CONFIDENTIAL</span>
            <p>{new Date().toLocaleDateString()}</p>
          </div>
        </header>

        <section className="print-section">
          <h2>Executive Summary</h2>
          <p>
            This report summarizes current threat activity relevant to your environment, maps exposure to critical assets, and
            outlines immediate response actions. Priority is placed on API abuse, AI supply chain risks, and ransomware readiness.
          </p>
        </section>

        <section className="print-section">
          <h2>Key Risks</h2>
          <ul>
            <li>API token theft via misconfigured gateways and leaked credentials.</li>
            <li>Dependency poisoning targeting CI/CD pipelines and model supply chains.</li>
            <li>Ransomware campaigns leveraging exposed remote access services.</li>
          </ul>
        </section>

        <section className="print-section grid">
          <div>
            <h3>Top CVEs</h3>
            <table>
              <thead>
                <tr>
                  <th>CVE</th>
                  <th>CVSS</th>
                  <th>Focus</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CVE-2025-1183</td>
                  <td>8.2</td>
                  <td>Dependency poisoning in build pipelines</td>
                </tr>
                <tr>
                  <td>CVE-2024-9912</td>
                  <td>9.1</td>
                  <td>OAuth token leakage</td>
                </tr>
                <tr>
                  <td>CVE-2024-8810</td>
                  <td>8.7</td>
                  <td>Gateway auth bypass</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <h3>Recommended Actions</h3>
            <ol>
              <li>Rotate API secrets and enforce OAuth PKCE.</li>
              <li>Pin dependencies and validate SBOM signatures.</li>
              <li>Enable IOC monitoring on high-risk endpoints.</li>
              <li>Run AI pentest simulations on internet-facing assets.</li>
            </ol>
          </div>
        </section>

        <section className="print-section">
          <h2>IOC Summary</h2>
          <p>Top indicators to watch include anomalous token usage, unusual outbound traffic, and unsigned model artifacts.</p>
          <div className="print-tags">
            <span>Suspicious IP clusters</span>
            <span>Malicious domains</span>
            <span>File hash alerts</span>
            <span>Unauthorized scope escalation</span>
          </div>
        </section>

        <footer className="print-footer">
          <p>Ironroot Security Platform • 622 Rainier Ave S, Seattle, WA</p>
        </footer>
        </div>
      </div>
    </AuthGate>
  );
}
