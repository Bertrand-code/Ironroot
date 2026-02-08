import React from 'react';
import { motion } from 'framer-motion';
import { Briefcase, KeyRound, UserCheck } from 'lucide-react';

const teamMembers = [
  {
    name: "Alex 'Zero' Carter",
    role: "Lead Offensive Engineer",
    bio: "A former NSA operator with a decade of experience in network exploitation and malware analysis.",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Dr. Evelyn Reed",
    role: "Head of Physical Security",
    bio: "Holds a PhD in social engineering and is a world-renowned expert in covert entry and physical penetration testing.",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  },
  {
    name: "Marco 'Proxy' Chen",
    role: "Principal Security Researcher",
    bio: "Specializes in application security and reverse engineering, with multiple CVEs to his name.",
    imageUrl: "https://images.unsplash.com/photo-1557862921-37829c790f19?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=300&q=80"
  }
];

export default function About() {
  return (
    <section id="about" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">The Minds Behind the Attacks</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">Ironroot was founded by veterans of national intelligence agencies and enterprise security teams with a mission: to deliver enterprise-grade security through an AI-powered unified platform.</p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-12 text-center mb-20">
          <div className="flex flex-col items-center">
            <Briefcase className="h-10 w-10 text-red-500 mb-4"/>
            <h3 className="text-xl font-semibold text-white">Elite Experience</h3>
            <p className="text-gray-400">Our team consists of operators from the world's most demanding intelligence and military cyber units.</p>
          </div>
           <div className="flex flex-col items-center">
            <KeyRound className="h-10 w-10 text-red-500 mb-4"/>
            <h3 className="text-xl font-semibold text-white">Unrivaled Discretion</h3>
            <p className="text-gray-400">We operate with the utmost professionalism and confidentiality, ensuring your data and our operations remain secure.</p>
          </div>
           <div className="flex flex-col items-center">
            <UserCheck className="h-10 w-10 text-red-500 mb-4"/>
            <h3 className="text-xl font-semibold text-white">Client-Focused</h3>
            <p className="text-gray-400">We embed with your team to understand your business and deliver actionable insights, not just a list of findings.</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="bg-gray-800/50 rounded-lg p-6 text-center border border-gray-700/50"
            >
              <img src={member.imageUrl} alt={member.name} className="w-24 h-24 rounded-full mx-auto mb-4 border-2 border-red-500" />
              <h3 className="text-lg font-bold text-white">{member.name}</h3>
              <p className="text-red-400 text-sm mb-2">{member.role}</p>
              <p className="text-gray-400 text-sm">{member.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}