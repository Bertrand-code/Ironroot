import React from 'react';
import { MapPin, Phone, Mail } from 'lucide-react';
import Logo from './logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <a href="#" className="flex items-center gap-2 mb-4">
              <Logo className="h-8 w-auto" />
              <span className="text-lg font-bold text-white">SecPro</span>
            </a>
            <p className="text-sm text-gray-400 mb-4">Enterprise Security Platform - AI-Powered. Comprehensive.</p>
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} SecPro. All Rights Reserved.</p>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Information</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="text-red-500 h-4 w-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-400">
                  <div>622 Rainier Ave S</div>
                  <div>Seattle, WA 98144</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-red-500 h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-gray-400">(206) 555-0199</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-red-500 h-4 w-4 flex-shrink-0" />
                <span className="text-sm text-gray-400">contact@secpro.com</span>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-white font-semibold mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#platform" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">AI Security</a></li>
              <li><a href="#codescanning" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Code Scanning</a></li>
              <li><a href="#api" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">API Security</a></li>
              <li><a href="#grc" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">GRC & Compliance</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Offensive Security</a></li>
              <li><a href="#services" className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer">Defensive Security</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}