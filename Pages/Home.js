import React from 'react';
import Hero from '../Components/Hero';
import Platform from '../components/Platform';
import Services from '../components/Services';
import CodeScanning from '../components/CodeScanning';
import GRC from '../components/grc';
import APIDocumentation from '../components/APIDocumentation';
import TrialRequest from '../components/TrialRequest';
import Contact from '../components/Contact';
import { motion } from 'framer-motion';

export default function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Hero />
      <Platform />
      <Services />
      <CodeScanning />
      <GRC />
      <APIDocumentation />
      <TrialRequest />
      <Contact />
    </motion.div>
  );
}