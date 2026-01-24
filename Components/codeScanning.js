export { default } from '../Components/codeScanning';
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
    <section id="codescanning" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">AI-Powered Code Security Scanning</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Upload your code or integrate with your Git repository. Our AI scans for vulnerabilities, ranks them by severity, and provides actionable resolution suggestions.
          </p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-gray-800/50 p-8 rounded-lg border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Upload & Scan</h3>
              
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
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white"
                >
                  <GitBranch className="mr-2 h-4 w-4" />
                  Connect Git Repository
                </Button>
              </div>

              <div className="mt-8 p-4 bg-gray-900/50 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Supported Languages:</p>
                <div className="flex flex-wrap gap-2">
                  {['JavaScript', 'Python', 'Java', 'C#', 'PHP', 'Ruby', 'Go'].map(lang => (
                    <span key={lang} className="px-3 py-1 bg-gray-800 text-gray-300 text-xs rounded-full">
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
            <h3 className="text-2xl font-bold text-white mb-6">Scan Results Overview</h3>
            
            <div className="space-y-4">
              {severityExamples.map((item, index) => (
                <div key={index} className={`${item.bg} p-6 rounded-lg border border-gray-700`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-6 w-6 ${item.color}`} />
                      <div>
                        <h4 className={`font-bold ${item.color}`}>{item.level} Severity</h4>
                        <p className="text-sm text-gray-400">Issues identified</p>
                      </div>
                    </div>
                    <span className={`text-3xl font-bold ${item.color}`}>{item.count}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="font-bold text-white mb-3">What You Get:</h4>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Detailed vulnerability descriptions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Severity ranking with CVSS scores</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Code-specific resolution suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
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