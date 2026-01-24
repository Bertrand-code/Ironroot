import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './logo';
import { createPageUrl } from '../utils';

const NavItem = ({ children, href, onClick }) => (
  <a
    href={href}
    onClick={onClick}
    className="text-gray-400 hover:text-red-500 transition-colors duration-300 text-sm font-medium"
  >
    {children}
  </a>
);

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuVariants = {
    closed: { opacity: 0, y: -20 },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const handleNavClick = (href) => {
    // If not on home page, navigate to home first
    if (window.location.pathname !== '/') {
      window.location.href = '/' + href;
    }
  };

  const navLinks = [
    { name: 'Home', href: createPageUrl('Home'), isPage: true },
    { name: 'Scanner', href: createPageUrl('CodeScanner'), isPage: true },
    { name: 'Threat Intel', href: createPageUrl('ThreatIntelligence'), isPage: true },
    { name: 'Auto-Fix', href: createPageUrl('AutoRemediation'), isPage: true },
    { name: 'Training', href: createPageUrl('SecurityTraining'), isPage: true },
    { name: 'Reports', href: createPageUrl('ReportCenter'), isPage: true },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-gray-900/80 backdrop-blur-lg border-b border-gray-800' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <a href={createPageUrl('Home')} className="flex items-center gap-2">
              <Logo className="h-8 w-auto" />
              <span className="text-xl font-bold text-white tracking-wider">SecPro</span>
            </a>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map(link => <NavItem key={link.name} href={link.href} onClick={(e) => {
                if (!link.isPage && window.location.pathname !== '/') {
                  e.preventDefault();
                  handleNavClick(link.href);
                }
              }}>{link.name}</NavItem>)}
            </nav>
            <div className="hidden md:block">
              <a
                href="#trial"
                onClick={(e) => {
                  if (window.location.pathname !== '/') {
                    e.preventDefault();
                    window.location.href = '/#trial';
                  }
                }}
                className="bg-red-600 text-white px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors duration-300"
              >
                Start Free Trial
              </a>
            </div>
            <div className="md:hidden">
              <button onClick={() => setIsOpen(!isOpen)} className="text-white">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="fixed top-16 left-0 right-0 bg-gray-900/95 backdrop-blur-lg z-40 p-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 items-center">
              {navLinks.map(link => <NavItem key={link.name} href={link.href} onClick={(e) => {
                if (!link.isPage && window.location.pathname !== '/') {
                  e.preventDefault();
                  handleNavClick(link.href);
                }
              }}>{link.name}</NavItem>)}
              <a
                href="#trial"
                onClick={(e) => {
                  if (window.location.pathname !== '/') {
                    e.preventDefault();
                    window.location.href = '/#trial';
                  }
                }}
                className="bg-red-600 text-white w-full text-center px-5 py-3 rounded-md text-sm font-semibold hover:bg-red-700 transition-colors duration-300"
              >
                Start Free Trial
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}