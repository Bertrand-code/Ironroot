import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShieldOff, Server } from 'lucide-react';

const FictionalLogo = ({ name }) => {
  const styles = {
    FinSecure: { icon: 'FS', color: 'text-blue-400' },
    HealthChain: { icon: 'H', color: 'text-green-400' },
    Innovatech: { icon: 'I', color: 'text-purple-400' },
  };
  const style = styles[name] || { icon: '?', color: 'text-gray-400' };

  return (
    <div className={`w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center border-2 border-gray-700`}>
      <span className={`font-bold text-2xl ${style.color}`}>{style.icon}</span>
    </div>
  );
};

const caseStudies = [
  {
    client: "FinSecure Bank",
    logoName: "FinSecure",
    title: "Preventing a Multi-Million Dollar Heist",
    challenge: "A major bank needed to validate the security of its new mobile banking API before a public launch, fearing undiscovered exploits.",
    action: "Our team conducted a two-week, multi-vector penetration test, combining API analysis with social engineering targeting the bank's developers.",
    result: "Discovered a critical authentication bypass flaw in the API. Our findings allowed the bank to patch the vulnerability, preventing potentially catastrophic financial losses.",
    icon: ShieldOff,
  },
  {
    client: "HealthChain Logistics",
    logoName: "HealthChain",
    title: "Securing Critical Patient Data",
    challenge: "A healthcare logistics provider was concerned about HIPAA compliance and the security of sensitive patient data across its supply chain network.",
    action: "We performed an 'assumed breach' scenario, simulating an attacker with initial access to their internal network, combined with a physical assessment of a key warehouse.",
    result: "Identified weaknesses in network segmentation and physical access controls. The client implemented our recommendations, significantly hardening their infrastructure against data breaches.",
    icon: Server,
  },
  {
    client: "Innovatech R&D",
    logoName: "Innovatech",
    title: "Protecting High-Value Intellectual Property",
    challenge: "A deep-tech R&D firm was worried about corporate espionage and the theft of valuable IP related to a breakthrough patent.",
    action: "Ironroot conducted a 3-month long Advanced Persistent Threat (APT) emulation, mimicking the tactics of a state-sponsored adversary.",
    result: "Our covert operations highlighted gaps in their detection and response capabilities. They enhanced their security monitoring, securing their IP and a major new patent.",
    icon: TrendingUp,
  }
];

export default function CaseStudies() {
  return (
    <section id="casestudies" className="py-20 md:py-32 bg-gray-900/50 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Real-World Impact</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">We don&apos;t just find vulnerabilities; we help our clients prevent disaster. See how our work translates to tangible security improvements.</p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <motion.div
              key={study.client}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-8 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-6">
                <FictionalLogo name={study.logoName} />
                <div>
                  <h3 className="text-xl font-bold text-white">{study.title}</h3>
                  <p className="text-red-500 font-semibold">{study.client}</p>
                </div>
              </div>
              <div className="space-y-4 text-gray-400">
                <p><strong className="text-gray-300">Challenge:</strong> {study.challenge}</p>
                <p><strong className="text-gray-300">Action:</strong> {study.action}</p>
                <p><strong className="text-gray-300">Result:</strong> {study.result}</p>
              </div>
              <div className="mt-auto pt-6">
                <div className="flex justify-end">
                    <study.icon className="h-8 w-8 text-gray-600"/>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
