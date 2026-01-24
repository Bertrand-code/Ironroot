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
    <section id="grc" className="py-20 md:py-32 bg-gray-800/30 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">GRC & Compliance Services</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Bridge the gap between technical security findings and business decisions. We quantify risks, ensure compliance, and deliver insights that matter to leadership.
          </p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {grcServices.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="bg-gray-900/50 p-6 rounded-lg border border-gray-700 hover:border-red-500/50 transition-all"
            >
              <div className="bg-red-600/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <service.icon className="h-6 w-6 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 text-sm">{service.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-red-900/20 to-gray-900/50 p-8 md:p-12 rounded-lg border border-red-900/30"
        >
          <div className="max-w-3xl mx-auto text-center">
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Security Findings, Quantified for the Boardroom
            </h3>
            <p className="text-gray-300 mb-6">
              Transform technical vulnerabilities into financial risk metrics. Our reports show potential business impact, compliance gaps, and ROI on security investments—in language that board members understand and act on.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">$XXM</div>
                <p className="text-sm text-gray-400">Potential Risk Exposure</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">XX%</div>
                <p className="text-sm text-gray-400">Compliance Coverage</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-500 mb-2">XX Days</div>
                <p className="text-sm text-gray-400">Average Remediation Time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}