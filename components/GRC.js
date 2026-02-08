import React from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Shield, TrendingUp, Users } from 'lucide-react';

const grcServices = [
  {
    icon: FileCheck,
    title: 'PCI DSS Assessment',
    description: 'Complete Payment Card Industry Data Security Standard compliance assessment and certification support.',
  },
  {
    icon: Shield,
    title: 'Vendor Security Reviews (TPRM)',
    description: 'Third-Party Risk Management: SOC 1/2/3, PCI, ISO 27001, SIG, CAIQ, SSAE 18, SaaS security assessments, vendor questionnaires.',
  },
  {
    icon: TrendingUp,
    title: 'Vulnerability Management',
    description: 'Continuous vulnerability scanning, asset discovery, prioritization, remediation tracking, and risk-based scoring.',
  },
  {
    icon: Users,
    title: 'Board-Level Reporting',
    description: 'Quantified security findings translated into business risk language that executives and board members understand.',
  },
];

export default function GRC() {
  return (
    <section id="grc" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="section-header"
        >
          <h2 className="title-lg">GRC & Compliance Services</h2>
          <p className="text-lead">
            Bridge the gap between technical security findings and business decisions. We quantify risks, ensure compliance, and deliver insights that matter to leadership.
          </p>
        </motion.div>

        <div className="grid grid-4" style={{ marginBottom: '40px' }}>
          {grcServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="card card--glass"
            >
              <service.icon className="brand__logo" />
              <h3 className="card__title" style={{ marginTop: '12px' }}>{service.title}</h3>
              <p className="card__meta">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card card--glass"
        >
          <div className="section-header" style={{ marginBottom: '0' }}>
            <h3 className="title-lg">
              Security Findings, Quantified for the Boardroom
            </h3>
            <p className="text-lead">
              Transform technical vulnerabilities into financial risk metrics. Our reports show potential business impact, compliance gaps, and ROI on security investments—in language that board members understand and act on.
            </p>
            <div className="grid grid-3" style={{ marginTop: '24px' }}>
              <div className="text-center">
                <div className="stat__value">$8.4M</div>
                <p className="card__meta">Potential Risk Exposure</p>
              </div>
              <div className="text-center">
                <div className="stat__value">94%</div>
                <p className="card__meta">Compliance Coverage</p>
              </div>
              <div className="text-center">
                <div className="stat__value">21 Days</div>
                <p className="card__meta">Average Remediation Time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
