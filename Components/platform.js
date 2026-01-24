export { default } from '../Components/platform';
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
    <section id="platform" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">The SecPro Platform</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Four integrated solutions working together to provide comprehensive security coverage for your organization.
          </p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {platforms.map((platform, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/50 p-8 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 cursor-pointer"
              onClick={() => platform.link && (window.location.href = createPageUrl(platform.link.replace('/', '')))}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="bg-red-600/10 p-3 rounded-lg">
                  <platform.icon className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{platform.title}</h3>
                  <p className="text-gray-400 mb-4">{platform.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {platform.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">{feature}</span>
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