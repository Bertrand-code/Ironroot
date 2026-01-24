import React from 'react';
import { motion } from 'framer-motion';
import { Code, Webhook, Lock, Zap } from 'lucide-react';

export default function APIDocumentation() {
  const apiFeatures = [
    { icon: Code, title: 'RESTful API', description: 'Clean, intuitive REST endpoints' },
    { icon: Webhook, title: 'Webhooks', description: 'Real-time event notifications' },
    { icon: Lock, title: 'OAuth 2.0', description: 'Secure authentication' },
    { icon: Zap, title: 'Rate Limiting', description: 'Built-in throttling & quotas' },
  ];

  return (
    <section id="api" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">API & Integrations</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-3xl mx-auto">
            Integrate SecPro into your existing security stack. Our comprehensive API allows you to automate scans, retrieve results, and manage security operations programmatically.
          </p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-2 gap-4 mb-8">
              {apiFeatures.map((feature, index) => (
                <div key={index} className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
                  <feature.icon className="h-8 w-8 text-red-500 mb-3" />
                  <h4 className="font-bold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-400">{feature.description}</p>
                </div>
              ))}
            </div>
            
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h4 className="font-bold text-white mb-4">Popular Integrations</h4>
              <div className="grid grid-cols-3 gap-4">
                {['Jira', 'Slack', 'GitHub', 'Jenkins', 'Splunk', 'PagerDuty'].map(tool => (
                  <div key={tool} className="bg-gray-900 p-3 rounded text-center">
                    <span className="text-sm text-gray-300">{tool}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-gray-950 p-6 rounded-lg border border-gray-800 font-mono text-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-auto text-xs text-gray-500">API Example</span>
            </div>
            <pre className="text-gray-300 overflow-x-auto">
              <code>{`curl -X POST https://api.secpro.com/v1/scan \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "repository": "github.com/org/repo",
    "branch": "main",
    "scan_type": "full"
  }'

# Response
{
  "scan_id": "scn_1234567890",
  "status": "processing",
  "estimated_time": "5m",
  "webhook_url": "https://your-app.com/hook"
}`}</code>
            </pre>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="#trial"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 transition-colors"
          >
            Get API Access with Free Trial
          </a>
          <p className="mt-4 text-sm text-gray-500">Full API documentation available after signup</p>
        </motion.div>
      </div>
    </section>
  );
}