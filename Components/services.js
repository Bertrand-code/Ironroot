export { default } from '../Components/services';
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
    title: 'Red Team Operations',
    description: 'Real-world attack simulations combining technical exploits, social engineering, and physical security assessments.',
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
    <section id="services" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Core Security Services</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Comprehensive security solutions powered by AI and delivered by expert security professionals.</p>
           <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {serviceItems.map((item, index) => (
            <motion.div
              key={index}
              variants={cardVariants}
              initial="offscreen"
              whileInView="onscreen"
              viewport={{ once: true, amount: 0.5 }}
              className="bg-gray-800/50 p-8 rounded-lg border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 group"
            >
              <div className="mb-6">
                <item.icon className="h-10 w-10 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
              <p className="text-gray-400 leading-relaxed">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}