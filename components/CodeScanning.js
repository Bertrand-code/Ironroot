import React from 'react';
import { motion } from 'framer-motion';
import { Upload, GitBranch, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '../utils';

export default function CodeScanning() {
  const severityExamples = [
    { level: 'Critical', color: 'text-red-500', bg: 'bg-red-500/10', count: '0', icon: AlertTriangle },
    { level: 'High', color: 'text-orange-500', bg: 'bg-orange-500/10', count: '0', icon: AlertTriangle },
    { level: 'Medium', color: 'text-yellow-500', bg: 'bg-yellow-500/10', count: '0', icon: Clock },
    { level: 'Low', color: 'text-blue-500', bg: 'bg-blue-500/10', count: '0', icon: CheckCircle },
  ];

  return (
    <section id="codescanning" className="section">
      <div className="container">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="section-header"
        >
          <h2 className="title-lg">AI-Powered Code Security Scanning</h2>
          <p className="text-lead">
            Upload your code or integrate with your Git repository. Our AI scans for vulnerabilities, ranks them by severity, and provides actionable resolution suggestions.
          </p>
        </motion.div>

        <div className="grid grid-2" style={{ alignItems: 'center' }}>
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="card card--glass">
              <h3 className="card__title">Upload & Scan</h3>
              
              <div className="space-y-6">
                <div 
                  onClick={() => window.location.href = createPageUrl('CodeScanner')}
                  className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-red-500 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-2">Drop your code files here</p>
                  <p className="text-sm text-gray-500">or click to start scanning</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 h-px bg-gray-700"></div>
                  <span className="text-gray-500 text-sm">OR</span>
                  <div className="flex-1 h-px bg-gray-700"></div>
                </div>

                <Button 
                  onClick={() => window.location.href = createPageUrl('CodeScanner')}
                  className="w-full"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Connect Git Repository
                </Button>
              </div>

              <div className="card card--glass" style={{ marginTop: '20px' }}>
                <p className="card__meta" style={{ marginBottom: '10px' }}>Supported Languages:</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go'].map(lang => (
                    <span key={lang} className="badge">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="card__title" style={{ marginBottom: '16px' }}>Scan Results Overview</h3>
            
            <div className="space-y-4">
              {severityExamples.map((item, index) => (
                <div key={index} className="card card--glass">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <item.icon className="brand__logo" />
                      <div>
                        <h4 className="card__title">{item.level} Severity</h4>
                        <p className="card__meta">Issues identified</p>
                      </div>
                    </div>
                    <span className="stat__value">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="card card--glass" style={{ marginTop: '20px' }}>
              <h4 className="card__title">What You Get:</h4>
              <ul className="grid" style={{ gap: '10px' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle className="brand__logo" size={18} />
                  <span>Detailed vulnerability descriptions</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle className="brand__logo" size={18} />
                  <span>Severity ranking with CVSS scores</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle className="brand__logo" size={18} />
                  <span>Code-specific resolution suggestions</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckCircle className="brand__logo" size={18} />
                  <span>Automated fix recommendations</span>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
