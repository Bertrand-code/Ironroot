import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertTriangle, Activity, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportGenerator from '../components/Reports/ReportGenerator';
import NotificationBell from '../components/Notifications/NotificationBell';

export default function DefensiveDashboard() {
  const [timeRange, setTimeRange] = useState('24h');

  const metrics = [
    { label: 'Threats Blocked', value: '1,847', change: '+12%', icon: Shield, color: 'text-green-500' },
    { label: 'Active Alerts', value: '23', change: '-8%', icon: AlertTriangle, color: 'text-yellow-500' },
    { label: 'System Health', value: '98.7%', change: '+2.1%', icon: Activity, color: 'text-blue-500' },
    { label: 'Response Time', value: '4.2s', change: '-15%', icon: Clock, color: 'text-purple-500' },
  ];

  const recentThreats = [
    { time: '14:32', type: 'Malware', severity: 'High', status: 'Blocked', source: '192.168.1.45' },
    { time: '14:15', type: 'Phishing', severity: 'Medium', status: 'Blocked', source: 'email.suspicious.com' },
    { time: '13:58', type: 'DDoS Attempt', severity: 'Critical', status: 'Mitigated', source: '203.45.67.89' },
    { time: '13:42', type: 'SQL Injection', severity: 'High', status: 'Blocked', source: 'api.endpoint' },
    { time: '13:20', type: 'Brute Force', severity: 'Medium', status: 'Blocked', source: '10.0.5.123' },
  ];

  const getSeverityColor = (severity) => {
    const colors = {
      Critical: 'text-red-500 bg-red-500/10',
      High: 'text-orange-500 bg-orange-500/10',
      Medium: 'text-yellow-500 bg-yellow-500/10',
      Low: 'text-blue-500 bg-blue-500/10',
    };
    return colors[severity] || colors.Medium;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Defensive Security Dashboard</h1>
            <p className="text-gray-400">Real-time threat monitoring and system health</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <NotificationBell />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">{metric.label}</CardTitle>
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{metric.value}</div>
                  <p className={`text-xs mt-1 ${metric.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {metric.change} from last period
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Recent Threats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="table w-full text-sm text-left text-gray-300">
                  <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                    <tr>
                      <th className="py-3 pr-4">Time</th>
                      <th className="py-3 pr-4">Threat</th>
                      <th className="py-3 pr-4">Severity</th>
                      <th className="py-3 pr-4">Source</th>
                      <th className="py-3 pr-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {recentThreats.map((threat, index) => (
                      <tr key={index}>
                        <td className="py-3 pr-4 text-gray-400">{threat.time}</td>
                        <td className="py-3 pr-4 text-white">{threat.type}</td>
                        <td className="py-3 pr-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(threat.severity)}`}>
                            {threat.severity}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-gray-400">{threat.source}</td>
                        <td className="py-3 pr-4 text-gray-400">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-green-500">{threat.status}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Posture</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Firewall Protection</span>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Intrusion Detection</span>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Endpoint Protection</span>
                    <span className="text-sm text-yellow-500">Monitoring</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-400">Threat Intelligence</span>
                    <span className="text-sm text-green-500">Updated</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500 mb-1">96.8%</div>
                    <p className="text-sm text-gray-400">Overall Security Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gray-800 border-gray-700 mt-8">
          <CardHeader>
            <CardTitle className="text-white">Export Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <ReportGenerator 
                data={{
                  summary: { 
                    critical: recentThreats.filter(t => t.severity === 'Critical').length,
                    high: recentThreats.filter(t => t.severity === 'High').length,
                    medium: recentThreats.filter(t => t.severity === 'Medium').length,
                    low: recentThreats.filter(t => t.severity === 'Low').length,
                    total: recentThreats.length
                  },
                  vulnerabilities: recentThreats.map(t => ({
                    severity: t.severity.toLowerCase(),
                    title: t.type,
                    description: `Threat detected from ${t.source} at ${t.time}. Status: ${t.status}`,
                    cwe_id: 'N/A',
                    cve_id: 'N/A',
                    owasp_category: 'Defensive Security Event',
                    remediation: `The threat has been ${t.status.toLowerCase()}. Continue monitoring for similar patterns.`
                  }))
                }}
                title="Defensive Security Report"
                type="defensive"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
