import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Map, TestTube2, ShieldAlert } from 'lucide-react';

const steps = [
  {
    icon: Eye,
    title: 'Reconnaissance',
    description: 'We gather intelligence from open-source and proprietary databases to build a comprehensive profile of your organization, just like a real attacker.',
  },
  {
    icon: Map,
    title: 'Weaponization & Delivery',
    description: 'Customized payloads and attack vectors are crafted. We then execute delivery through channels like spear-phishing or exploiting external-facing services.',
  },
  {
    icon: TestTube2,
    title: 'Exploitation & Escalation',
    description: 'Once initial access is gained, we pivot through your network, escalating privileges and moving laterally to identify and exfiltrate target data.',
  },
  {
    icon: ShieldAlert,
    title: 'Reporting & Remediation',
    description: 'We provide a detailed report with an executive summary, technical findings, and actionable recommendations to harden your defenses effectively.',
  },
];

export default function Methodology() {
  return (
    <section id="methodology" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Our Attack Methodology</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">We follow a structured, intelligence-driven approach to emulate sophisticated threats with precision.</p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>
        
        <div className="relative">
          <div className="absolute left-1/2 -translate-x-1/2 top-10 bottom-10 w-0.5 bg-gray-700 hidden lg:block" aria-hidden="true"></div>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className={`flex items-center w-full mb-8 lg:mb-0`}
            >
              <div className="flex lg:flex-row flex-col items-center w-full">
                <div className={`flex-1 lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-16 lg:text-right' : 'lg:pl-16 lg:order-2'}`}>
                  <h3 className="text-2xl font-bold text-red-500 mb-2">{`Step ${index + 1}: ${step.title}`}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
                <div className="flex-shrink-0 w-20 h-20 rounded-full bg-gray-800 border-2 border-red-500 flex items-center justify-center my-4 lg:my-0 lg:order-1">
                  <step.icon className="h-10 w-10 text-white" />
                </div>
                 <div className="flex-1 lg:w-1/2 hidden lg:block"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}