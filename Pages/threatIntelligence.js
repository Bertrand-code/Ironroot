import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Search, Zap, Shield, AlertTriangle, TrendingUp, Globe, Database, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ThreatIntelligence() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setSearching(true);
    try {
      const intelligence = await base44.integrations.Core.InvokeLLM({
        prompt: `You are an expert threat intelligence analyst. Provide comprehensive threat intelligence on: "${query}"

Search the web for the LATEST information including:
- Recent CVEs and security advisories
- Active exploits in the wild
- Threat actor groups and campaigns
- Indicators of Compromise (IoCs)
- MITRE ATT&CK techniques
- Security patches and fixes
- Real-world attack scenarios

Provide actionable intelligence with sources.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            threat_level: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
            summary: { type: 'string' },
            cves: { 
              type: 'array', 
              items: { 
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  cvss: { type: 'number' },
                  description: { type: 'string' },
                  published: { type: 'string' }
                }
              }
            },
            attack_vectors: { type: 'array', items: { type: 'string' } },
            mitre_tactics: { type: 'array', items: { type: 'string' } },
            indicators: {
              type: 'object',
              properties: {
                ip_addresses: { type: 'array', items: { type: 'string' } },
                domains: { type: 'array', items: { type: 'string' } },
                file_hashes: { type: 'array', items: { type: 'string' } }
              }
            },
            remediation: { type: 'string' },
            references: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      setResults(intelligence);
    } catch (err) {
      console.error('Threat intelligence error:', err);
    } finally {
      setSearching(false);
    }
  };

  const threatLevelColors = {
    critical: 'bg-red-500/10 text-red-500 border-red-500',
    high: 'bg-orange-500/10 text-orange-500 border-orange-500',
    medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
    low: 'bg-blue-500/10 text-blue-500 border-blue-500'
  };

  const quickSearches = [
    'Log4Shell vulnerability',
    'MOVEit Transfer CVE-2023-34362',
    'Ransomware trends 2026',
    'APT41 tactics',
    'Zero-day exploits 2026'
  ];

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Zap className="h-8 w-8 text-red-500" />
            Advanced Threat Intelligence
          </h1>
          <p className="text-gray-400 mt-2">Real-time CVE tracking, exploit intelligence, and threat actor monitoring</p>
        </div>

        {/* Search */}
        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardContent className="pt-6">
            <div className="flex gap-3 mb-4">
              <Input
                placeholder="Search for CVEs, vulnerabilities, threat actors, malware..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
                className="bg-gray-900 border-gray-700 text-white"
              />
              <Button
                onClick={() => handleSearch(searchQuery)}
                disabled={searching}
                className="bg-red-600 hover:bg-red-700"
              >
                {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {quickSearches.map((query, idx) => (
                <Button
                  key={idx}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSearch(query)}
                  className="text-xs"
                >
                  {query}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Threat Level */}
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">Threat Level Assessment</h3>
                      <p className="text-gray-400">{results.summary}</p>
                    </div>
                    <Badge className={`${threatLevelColors[results.threat_level]} border text-lg px-4 py-2`}>
                      {results.threat_level?.toUpperCase()}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* CVEs */}
              {results.cves?.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Known CVEs ({results.cves.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {results.cves.map((cve, idx) => (
                        <div key={idx} className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-mono text-red-400">{cve.id}</h4>
                            <Badge className={cve.cvss >= 9 ? 'bg-red-500' : cve.cvss >= 7 ? 'bg-orange-500' : 'bg-yellow-500'}>
                              CVSS {cve.cvss}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-300">{cve.description}</p>
                          <p className="text-xs text-gray-500 mt-2">Published: {cve.published}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attack Vectors & MITRE */}
              <div className="grid md:grid-cols-2 gap-6">
                {results.attack_vectors?.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Target className="h-5 w-5 text-orange-500" />
                        Attack Vectors
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {results.attack_vectors.map((vector, idx) => (
                          <li key={idx} className="text-sm text-gray-300 flex items-start gap-2">
                            <span className="text-red-500">▸</span>
                            {vector}
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                {results.mitre_tactics?.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-500" />
                        MITRE ATT&CK Tactics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {results.mitre_tactics.map((tactic, idx) => (
                          <Badge key={idx} variant="outline" className="border-blue-500 text-blue-400">
                            {tactic}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* IoCs */}
              {(results.indicators?.ip_addresses?.length > 0 || 
                results.indicators?.domains?.length > 0 || 
                results.indicators?.file_hashes?.length > 0) && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Database className="h-5 w-5 text-purple-500" />
                      Indicators of Compromise (IoCs)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ips">
                      <TabsList className="bg-gray-900">
                        {results.indicators.ip_addresses?.length > 0 && <TabsTrigger value="ips">IP Addresses</TabsTrigger>}
                        {results.indicators.domains?.length > 0 && <TabsTrigger value="domains">Domains</TabsTrigger>}
                        {results.indicators.file_hashes?.length > 0 && <TabsTrigger value="hashes">File Hashes</TabsTrigger>}
                      </TabsList>
                      {results.indicators.ip_addresses?.length > 0 && (
                        <TabsContent value="ips" className="space-y-2">
                          {results.indicators.ip_addresses.map((ip, idx) => (
                            <div key={idx} className="p-2 bg-gray-900/50 rounded font-mono text-sm text-gray-300">{ip}</div>
                          ))}
                        </TabsContent>
                      )}
                      {results.indicators.domains?.length > 0 && (
                        <TabsContent value="domains" className="space-y-2">
                          {results.indicators.domains.map((domain, idx) => (
                            <div key={idx} className="p-2 bg-gray-900/50 rounded font-mono text-sm text-gray-300">{domain}</div>
                          ))}
                        </TabsContent>
                      )}
                      {results.indicators.file_hashes?.length > 0 && (
                        <TabsContent value="hashes" className="space-y-2">
                          {results.indicators.file_hashes.map((hash, idx) => (
                            <div key={idx} className="p-2 bg-gray-900/50 rounded font-mono text-xs text-gray-300 break-all">{hash}</div>
                          ))}
                        </TabsContent>
                      )}
                    </Tabs>
                  </CardContent>
                </Card>
              )}

              {/* Remediation */}
              <Card className="bg-green-500/5 border-green-500/30">
                <CardHeader>
                  <CardTitle className="text-white">Remediation Guidance</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-wrap">{results.remediation}</p>
                </CardContent>
              </Card>

              {/* References */}
              {results.references?.length > 0 && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">References & Sources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {results.references.map((ref, idx) => (
                        <a
                          key={idx}
                          href={ref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-400 hover:text-blue-300 block hover:underline"
                        >
                          {ref}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}