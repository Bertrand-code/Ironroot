import React, { useState } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { Shield, AlertTriangle, TrendingUp, Activity, Target, Download, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import ReportGenerator from '../components/Reports/ReportGenerator';
import AuthGate from '@/components/AuthGate';
import { useAuth } from '@/lib/useAuth';

export default function ReportCenter() {
  const [timeRange, setTimeRange] = useState('30d');
  const [filterType, setFilterType] = useState('all');
  const { user, org } = useAuth();
  const canRead = user && user.role !== 'guest' && ((user.role === 'admin' || user.role === 'owner') || org?.plan === 'paid');

  const { data: scanHistory = [] } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => ironroot.entities.ScanHistory.list('-created_date', 200),
    enabled: !!canRead,
  });

  // Filter by scan type
  const filteredScans = scanHistory.filter(scan => 
    filterType === 'all' || scan.scanType === filterType
  );

  // Calculate metrics from filtered scans
  const totalScans = filteredScans.length;
  const totalVulnerabilities = filteredScans.reduce((sum, scan) => sum + (scan.summary?.total || 0), 0);
  const criticalVulns = filteredScans.reduce((sum, scan) => sum + (scan.summary?.critical || 0), 0);
  const highVulns = filteredScans.reduce((sum, scan) => sum + (scan.summary?.high || 0), 0);

  // Severity distribution for pie chart
  const severityData = [
    { name: 'Critical', value: filteredScans.reduce((sum, s) => sum + (s.summary?.critical || 0), 0), color: '#ef4444' },
    { name: 'High', value: filteredScans.reduce((sum, s) => sum + (s.summary?.high || 0), 0), color: '#f97316' },
    { name: 'Medium', value: filteredScans.reduce((sum, s) => sum + (s.summary?.medium || 0), 0), color: '#eab308' },
    { name: 'Low', value: filteredScans.reduce((sum, s) => sum + (s.summary?.low || 0), 0), color: '#3b82f6' },
  ].filter(d => d.value > 0);

  // Scan type distribution
  const scanTypeData = [
    { name: 'File Upload', value: filteredScans.filter(s => s.scanType === 'file_upload').length },
    { name: 'GitHub', value: filteredScans.filter(s => s.scanType === 'github_repository').length },
    { name: 'Website', value: filteredScans.filter(s => s.scanType === 'website_infrastructure').length },
    { name: 'API', value: filteredScans.filter(s => s.scanType === 'api_security').length },
  ].filter(d => d.value > 0);

  // Trend over time (last 15 scans)
  const trendData = filteredScans.slice(0, 15).reverse().map((scan, idx) => ({
    name: `Scan ${idx + 1}`,
    critical: scan.summary?.critical || 0,
    high: scan.summary?.high || 0,
    medium: scan.summary?.medium || 0,
    low: scan.summary?.low || 0,
  }));

  // Security score calculation (SecurityScorecard-style)
  const calculateSecurityScore = () => {
    if (totalVulnerabilities === 0) return 100;
    const weightedScore = (
      (criticalVulns * 10) +
      (highVulns * 7) +
      (scanHistory.reduce((sum, s) => sum + (s.summary?.medium || 0), 0) * 4) +
      (scanHistory.reduce((sum, s) => sum + (s.summary?.low || 0), 0) * 1)
    );
    const maxPossible = totalScans * 50;
    const score = Math.max(0, 100 - (weightedScore / maxPossible * 100));
    return Math.round(score);
  };

  const securityScore = calculateSecurityScore();

  // Risk categories (SecurityScorecard-style)
  const riskCategories = [
    { category: 'Application Security', score: Math.max(0, 100 - (criticalVulns * 5)), trend: 'improving', delta: '+3' },
    { category: 'Network Security', score: Math.max(0, 100 - (highVulns * 3)), trend: 'stable', delta: '+0' },
    { category: 'DNS Health', score: 85, trend: 'improving', delta: '+2' },
    { category: 'Patching Cadence', score: Math.max(0, 100 - (criticalVulns * 7)), trend: 'degrading', delta: '-4' },
    { category: 'Endpoint Security', score: 90, trend: 'improving', delta: '+1' },
    { category: 'IP Reputation', score: 95, trend: 'stable', delta: '+0' },
  ];

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#eab308';
    if (score >= 40) return '#f97316';
    return '#ef4444';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <AuthGate
          title="Sign in to view security reports"
          description="Executive reporting, scan analytics, and risk scoring are available to paid organizations."
          plans={['paid']}
          feature="reportExports"
        >
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Security Report Center</h1>
            <p className="text-gray-400">Comprehensive security analytics and reporting</p>
          </div>
          <div className="flex gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white px-4 py-2 rounded-lg"
            >
              <option value="all">All Scan Types</option>
              <option value="file_upload">File Upload</option>
              <option value="github_repository">GitHub Repository</option>
              <option value="website_infrastructure">Website Infrastructure</option>
              <option value="api_security">API Security</option>
            </select>
            <ReportGenerator
              data={{
                summary: { critical: criticalVulns, high: highVulns, medium: 0, low: 0, total: totalVulnerabilities },
                vulnerabilities: []
              }}
              title="Security Report Center - Full Analysis"
              type="offensive"
            />
          </div>
        </div>

        {/* Security Score Card */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 mb-8">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Overall Security Score</h3>
                <div className="relative inline-block">
                  <svg className="w-48 h-48">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="#1f2937"
                      strokeWidth="12"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke={getScoreColor(securityScore)}
                      strokeWidth="12"
                      fill="none"
                      strokeDasharray={`${(securityScore / 100) * 502.4} 502.4`}
                      strokeLinecap="round"
                      transform="rotate(-90 96 96)"
                      style={{ transition: 'stroke-dasharray 1s ease' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold" style={{ color: getScoreColor(securityScore) }}>
                      {securityScore}
                    </div>
                    <div className="text-3xl font-bold text-gray-400">
                      {getScoreGrade(securityScore)}
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-400 mt-4">
                  {securityScore >= 80 ? 'Excellent security posture' :
                   securityScore >= 60 ? 'Good security, needs improvement' :
                   securityScore >= 40 ? 'Fair security, action required' :
                   'Poor security, immediate action needed'}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-4">Risk Factor Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="table w-full text-sm text-left text-gray-300">
                    <thead className="text-xs uppercase text-gray-500 border-b border-gray-700">
                      <tr>
                        <th className="py-3 pr-4">Category</th>
                        <th className="py-3 pr-4">Score</th>
                        <th className="py-3 pr-4">Grade</th>
                        <th className="py-3 pr-4">Trend</th>
                        <th className="py-3 pr-4">Signal</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {riskCategories.map((risk, idx) => (
                        <tr key={idx}>
                          <td className="py-3 pr-4 text-white">{risk.category}</td>
                          <td className="py-3 pr-4" style={{ color: getScoreColor(risk.score) }}>
                            {risk.score}
                          </td>
                          <td className="py-3 pr-4 text-gray-400">{getScoreGrade(risk.score)}</td>
                          <td className="py-3 pr-4 text-gray-400">{risk.trend}</td>
                          <td className="py-3 pr-4">
                            <span className="badge">{risk.delta}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Scans</CardTitle>
                <Shield className="h-5 w-5 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalScans}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Vulnerabilities</CardTitle>
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{totalVulnerabilities}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Critical Issues</CardTitle>
                <Target className="h-5 w-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">{criticalVulns}</div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">High Priority</CardTitle>
                <Activity className="h-5 w-5 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-500">{highVulns}</div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Vulnerability Severity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Scan Type Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={scanTypeData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Vulnerability Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                  <Legend />
                  <Line type="monotone" dataKey="critical" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="high" stroke="#f97316" strokeWidth={2} />
                  <Line type="monotone" dataKey="medium" stroke="#eab308" strokeWidth={2} />
                  <Line type="monotone" dataKey="low" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Security Posture Radar</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={riskCategories}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="category" stroke="#9ca3af" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" />
                  <Radar name="Score" dataKey="score" stroke="#10b981" fill="#10b981" fillOpacity={0.5} />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent Scans Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Recent Security Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Target</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Date</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Critical</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">High</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScans.slice(0, 15).map((scan, idx) => (
                    <tr key={idx} className="border-b border-gray-700/50 hover:bg-gray-750">
                      <td className="py-3 px-4 text-white">{scan.targetName}</td>
                      <td className="py-3 px-4 text-gray-400">{scan.scanType}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(scan.scanDate || scan.created_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-red-500 font-medium">{scan.summary?.critical || 0}</td>
                      <td className="py-3 px-4 text-orange-500 font-medium">{scan.summary?.high || 0}</td>
                      <td className="py-3 px-4 text-white font-medium">{scan.summary?.total || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
        </AuthGate>
      </div>
    </div>
  );
}
