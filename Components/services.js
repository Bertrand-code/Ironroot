import React from 'react';
import { motion } from 'framer-motion';
import { Target, Users, Building, BrainCircuit } from 'lucide-react';

const serviceItems = [
  {
    icon: Target,
    title: 'AI Security',
    description: 'Advanced AI-powered threat detection, anomaly identification, and predictive security analytics to stay ahead of emerging threats.',
  },
  {
    icon: Users,
    title: 'API Security & Exploits',
    description: 'Comprehensive API security testing, vulnerability discovery, and exploit analysis to secure your API endpoints and integrations.',
  },
  {
    icon: Building,
    title: 'Penetration Testing',
    description: 'Full-spectrum offensive security testing across networks, applications, cloud infrastructure, and mobile platforms.',
  },
  {
    icon: BrainCircuit,
    title: 'AI Pentest Service',
    description: 'Continuous AI-driven penetration testing that validates exploitability, maps blast radius, and auto-builds remediation playbooks.',
  },
];

const cardVariants = {
  offscreen: {
    y: 50,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      bounce: 0.4,
      duration: 0.8,
    },
  },
};

export default function Services() {
  return (
    <section id="services" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <h2 className="title-lg">Core Security Services</h2>
          <p className="text-lead">Comprehensive security solutions powered by AI and delivered by expert security professionals.</p>
        </motion.div>
        
        <div className="grid grid-4">
          {serviceItems.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              className="card card--glass"
            >
              <item.icon className="brand__logo" />
              <h3 className="card__title" style={{ marginTop: '12px' }}>{item.title}</h3>
              <p className="card__meta">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
