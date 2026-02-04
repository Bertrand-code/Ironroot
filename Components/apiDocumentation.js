import React from 'react';
import { motion } from 'framer-motion';
import { Code, Webhook, Lock, Zap } from 'lucide-react';

export default function APIDocumentation() {
  const apiFeatures = [
    { icon: Code, title: 'RESTful API', description: 'Clean, intuitive REST endpoints' },
    { icon: Webhook, title: 'Webhooks', description: 'Real-time event notifications' },
    { icon: Lock, title: 'OAuth 2.0', description: 'Secure authentication' },
    { icon: Zap, title: 'Rate Limiting', description: 'Built-in throttling & quotas' },
  ];

  return (
    <section id="api" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="title-lg">API & Integrations</h2>
          <p className="text-lead">
            Integrate SecPro into your existing security stack. Our comprehensive API allows you to automate scans, retrieve results, and manage security operations programmatically.
          </p>
        </motion.div>

        <div className="grid grid-2" style={{ alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-2" style={{ marginBottom: '20px' }}>
              {apiFeatures.map((feature, index) => (
                <div key={index} className="card card--glass">
                  <feature.icon className="brand__logo" />
                  <h4 className="card__title" style={{ marginTop: '10px' }}>{feature.title}</h4>
                  <p className="card__meta">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="card card--glass">
              <h4 className="card__title">Popular Integrations</h4>
              <div className="grid grid-3" style={{ marginTop: '12px' }}>
                {['Jira', 'Slack', 'GitHub', 'Jenkins', 'Splunk', 'PagerDuty'].map(tool => (
                  <div key={tool} className="card card--glass" style={{ padding: '12px', textAlign: 'center' }}>
                    <span className="card__meta">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card card--glass"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span className="badge">API Example</span>
            </div>
            <pre className="card__meta" style={{ fontFamily: 'IBM Plex Mono, monospace', overflowX: 'auto' }}>
              <code>{`curl -X POST https://api.secpro.com/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository": "github.com/org/repo",
    "branch": "main",
    "scan_type": "full"
  }'

# Response
{
  "scan_id": "scn_1234567890",
  "status": "processing",
  "estimated_time": "5m",
  "webhook_url": "https://your-app.com/hook"
}`}</code>
            </pre>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <a
            href="#trial"
            className="btn btn--primary"
          >
            Get API Access with Free Trial
          </a>
          <p className="card__meta" style={{ marginTop: '12px' }}>Full API documentation available after signup</p>
        </motion.div>
      </div>
    </section>
  );
}
