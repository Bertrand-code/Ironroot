import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Crosshair, BarChart3, Bug } from 'lucide-react';
import { createPageUrl } from '../utils';

const platforms = [
  {
    icon: Shield,
    title: 'Defensive Security',
    description: 'Real-time threat detection, SOC operations, vulnerability management with AI-powered analytics and automated response capabilities.',
    features: ['24/7 Monitoring', 'Incident Response', 'Threat Intelligence', 'Custom Dashboards'],
    link: '/DefensiveDashboard'
  },
  {
    icon: Crosshair,
    title: 'Offensive Security',
    description: 'Penetration testing, red teaming, social engineering, and exploit development to test your defenses against real-world attacks.',
    features: ['Pen Testing', 'Red Team Ops', 'Social Engineering', 'Exploit Analysis'],
    link: '/OffensiveDashboard'
  },
  {
    icon: BarChart3,
    title: 'GRC & Compliance',
    description: 'Board-ready reports, PCI DSS assessments, vendor security reviews (TPRM), vulnerability management, and risk quantification.',
    features: ['PCI DSS Assessment', 'Vendor Reviews (TPRM)', 'Vulnerability Mgmt', 'Risk Quantification']
  },
  {
    icon: Bug,
    title: 'AI Security Scanning',
    description: 'Upload or push code for automated security analysis. AI identifies vulnerabilities and provides severity-based resolution suggestions.',
    features: ['Code Analysis', 'API Security', 'Severity Scoring', 'Fix Recommendations']
  },
];

export default function Platform() {
  return (
    <section id="platform" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <h2 className="title-lg">The SecPro Platform</h2>
          <p className="text-lead">
            Four integrated solutions working together to provide comprehensive security coverage for your organization.
          </p>
        </motion.div>

        <div className="grid grid-2">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card card--glass"
              onClick={() => platform.link && (window.location.href = createPageUrl(platform.link.replace('/', '')))}
            >
              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <div className="badge">
                  <platform.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="card__title">{platform.title}</h3>
                  <p className="card__meta">{platform.description}</p>
                </div>
              </div>
              <div className="grid grid-2" style={{ marginTop: '16px' }}>
                {platform.features.map((feature, idx) => (
                  <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span className="dot" />
                    <span className="card__meta">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
