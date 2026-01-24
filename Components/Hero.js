export { default } from './Hero';
import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center text-center overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-grid-red-500/10 [mask-image:linear-gradient(to_bottom,white_20%,transparent_100%)]"></div>
       <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 container mx-auto px-6"
      >
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight mb-6">
          <span className="block">Enterprise Security Platform</span>
          <span className="block text-red-500">AI-Powered. Comprehensive.</span>
        </h1>
        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-400 mb-10">
          SecPro delivers AI-driven security scanning, offensive & defensive security operations, GRC compliance, and API security—all in one unified platform. From code vulnerability detection to board-level reporting.
        </p>
        <a
          href="#trial"
          className="inline-flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
        >
          <span>Start Free Trial</span>
          <ArrowRight size={20} />
        </a>
      </motion.div>
    </section>
  );
}