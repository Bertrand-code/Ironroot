import React, { useState } from 'react';
import { secpro } from '@/lib/secproClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Shield, Zap, AlertTriangle, CheckCircle, Loader2, Code } from 'lucide-react';
import { motion } from 'framer-motion';

export default function APISecurity() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiHeaders, setApiHeaders] = useState('');
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState(null);

  const handleScan = async () => {
    setScanning(true);
    try {
      const analysis = await secpro.integrations.Core.InvokeLLM({
        prompt: `You are an ELITE API security expert with deep knowledge of OWASP API Security Top 10 2023. Perform a COMPREHENSIVE security audit of the API endpoint: ${apiUrl}

🔍 **ADVANCED API SECURITY TESTING**:

**1. AUTHENTICATION & AUTHORIZATION**
- Broken Object Level Authorization (BOLA/IDOR)
- Broken User Authentication (JWT vulnerabilities, weak tokens)
- Excessive Data Exposure in responses
- Lack of Resources & Rate Limiting
- Missing Function Level Access Control
- Mass Assignment vulnerabilities

**2. API SECURITY TOP 10 2023**
- API1:2023 - Broken Object Level Authorization
- API2:2023 - Broken Authentication
- API3:2023 - Broken Object Property Level Authorization
- API4:2023 - Unrestricted Resource Consumption
- API5:2023 - Broken Function Level Authorization
- API6:2023 - Unrestricted Access to Sensitive Business Flows
- API7:2023 - Server Side Request Forgery (SSRF)
- API8:2023 - Security Misconfiguration
- API9:2023 - Improper Inventory Management
- API10:2023 - Unsafe Consumption of APIs

**3. INJECTION ATTACKS**
- SQL Injection via API parameters
- NoSQL Injection in MongoDB/DynamoDB APIs
- XML Injection / XXE
- LDAP Injection
- Command Injection
- GraphQL Injection

**4. DATA VALIDATION & SANITIZATION**
- Input validation bypass
- Type confusion vulnerabilities
- JSON/XML parsing vulnerabilities
- Schema validation failures
- Regex DoS (ReDoS)

**5. SECURITY HEADERS & CORS**
- Missing security headers (X-Content-Type-Options, X-Frame-Options, CSP)
- CORS misconfiguration allowing unauthorized origins
- Exposed sensitive headers

**6. RATE LIMITING & DOS PROTECTION**
- Missing rate limiting
- Account enumeration vulnerabilities
- Brute force protection
- GraphQL query depth/complexity limits

**7. API VERSIONING & DOCUMENTATION**
- Exposed old API versions with vulnerabilities
- Swagger/OpenAPI documentation exposing sensitive endpoints
- API key exposure in documentation

**8. CRYPTOGRAPHIC FAILURES**
- Weak TLS/SSL configuration
- Insecure data transmission
- Plaintext secrets in responses
- Weak encryption algorithms

Headers to analyze:
${apiHeaders || 'No custom headers provided'}

For EACH vulnerability provide:
- severity: "critical"/"high"/"medium"/"low"
- title: API-specific vulnerability name
- description: Technical explanation with API context
- owasp_category: OWASP API Top 10 2023 category
- endpoint: Affected API endpoint
- attackScenario: API exploitation scenario with example requests
- remediation: API-specific fix with code examples
- references: OWASP API Security, vendor documentation`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            summary: {
              type: 'object',
              properties: {
                critical: { type: 'number' },
                high: { type: 'number' },
                medium: { type: 'number' },
                low: { type: 'number' },
                total: { type: 'number' }
              }
            },
            vulnerabilities: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  severity: { type: 'string' },
                  title: { type: 'string' },
                  description: { type: 'string' },
                  owasp_category: { type: 'string' },
                  endpoint: { type: 'string' },
                  attackScenario: { type: 'string' },
                  remediation: { type: 'string' },
                  references: { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      });

      setResults(analysis);
      
      // Save to history
      const user = await secpro.auth.me();
      await secpro.entities.ScanHistory.create({
        scanType: 'api_security',
        targetName: apiUrl,
        summary: analysis.summary || { critical: 0, high: 0, medium: 0, low: 0, total: 0 },
        vulnerabilities: analysis.vulnerabilities || [],
        scanDate: new Date().toISOString(),
        scannedBy: user.email
      });
    } catch (err) {
      console.error('API scan error:', err);
    } finally {
      setScanning(false);
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/10 text-red-500 border-red-500',
      high: 'bg-orange-500/10 text-orange-500 border-orange-500',
      medium: 'bg-yellow-500/10 text-yellow-500 border-yellow-500',
      low: 'bg-blue-500/10 text-blue-500 border-blue-500'
    };
    return colors[severity?.toLowerCase()] || colors.low;
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="h-8 w-8 text-red-500" />
            API Security Scanner
          </h1>
          <p className="text-gray-400 mt-2">Advanced API vulnerability detection using OWASP API Security Top 10 2023</p>
        </div>

        <Card className="bg-gray-800 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Configure API Scan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">API Endpoint URL</label>
              <Input
                placeholder="https://api.example.com/v1/users"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-2 block">Headers (optional, JSON format)</label>
              <Textarea
                placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}'
                value={apiHeaders}
                onChange={(e) => setApiHeaders(e.target.value)}
                className="bg-gray-900 border-gray-700 text-white h-24"
              />
            </div>
            <Button
              onClick={handleScan}
              disabled={!apiUrl || scanning}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              {scanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning API...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Start API Security Scan
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {results && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Scan Results</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-4">
                  {['critical', 'high', 'medium', 'low', 'total'].map((severity) => (
                    <div key={severity} className={`p-4 rounded-lg border ${
                      severity === 'total' ? 'bg-gray-700 border-gray-600' : getSeverityColor(severity)
                    }`}>
                      <div className="text-2xl font-bold">
                        {results.summary?.[severity] || 0}
                      </div>
                      <div className="text-sm capitalize">{severity}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              {results.vulnerabilities?.map((vuln, index) => (
                <Card key={index} className="bg-gray-800 border-gray-700">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                          <h3 className="font-bold text-white text-lg">{vuln.title}</h3>
                        </div>
                        <Badge className={getSeverityColor(vuln.severity)}>
                          {vuln.severity?.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300 mb-1">Description</h4>
                        <p className="text-sm text-gray-400">{vuln.description}</p>
                      </div>
                      {vuln.endpoint && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-1">Affected Endpoint</h4>
                          <code className="text-sm text-blue-400 bg-gray-900 px-2 py-1 rounded">
                            {vuln.endpoint}
                          </code>
                        </div>
                      )}
                      {vuln.attackScenario && (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-300 mb-1">Attack Scenario</h4>
                          <p className="text-sm text-gray-400 whitespace-pre-wrap">{vuln.attackScenario}</p>
                        </div>
                      )}
                      {vuln.remediation && (
                        <div className="bg-green-500/5 p-3 rounded border border-green-500/20">
                          <h4 className="text-sm font-semibold text-green-400 mb-1">Remediation</h4>
                          <p className="text-sm text-gray-300">{vuln.remediation}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}