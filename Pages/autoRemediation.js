import React, { useState } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Zap, Code, Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AutoRemediation() {
  const [selectedVuln, setSelectedVuln] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [fixCode, setFixCode] = useState(null);

  const { data: scanHistory = [] } = useQuery({
    queryKey: ['scanHistory'],
    queryFn: () => ironroot.entities.ScanHistory.list('-created_date', 50),
  });

  // Get all vulnerabilities from recent scans
  const allVulnerabilities = scanHistory.flatMap(scan => 
    (scan.vulnerabilities || []).map(v => ({
      ...v,
      scanId: scan.id,
      scanType: scan.scanType,
      targetName: scan.targetName,
      scanDate: scan.scanDate
    }))
  );

  const generateFix = async (vulnerability) => {
    setGenerating(true);
    setSelectedVuln(vulnerability);
    
    try {
      const fixSolution = await ironroot.integrations.Core.InvokeLLM({
        prompt: `You are an expert security engineer specializing in automated vulnerability remediation.

Generate a COMPLETE, PRODUCTION-READY code fix for this vulnerability:

**Vulnerability Details:**
- Title: ${vulnerability.title}
- Severity: ${vulnerability.severity}
- Description: ${vulnerability.description}
- CWE: ${vulnerability.cwe_id || 'N/A'}
- CVE: ${vulnerability.cve_id || 'N/A'}

**Current Vulnerable Code:**
\`\`\`
${vulnerability.affectedCode || 'Not provided'}
\`\`\`

**Requirements:**
1. Provide the complete fixed code (not just snippets)
2. Include all necessary imports and dependencies
3. Add inline comments explaining the security improvements
4. Follow language-specific best practices
5. Include unit tests to verify the fix
6. Provide installation commands for any new dependencies

**Output Format:**
Return a JSON object with:
- fixed_code: Complete secure implementation
- changes_summary: Brief explanation of what was fixed
- dependencies: Array of new dependencies needed
- test_code: Unit tests for the fix
- verification_steps: How to verify the fix works`,
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            fixed_code: { type: 'string' },
            changes_summary: { type: 'string' },
            dependencies: { type: 'array', items: { type: 'string' } },
            test_code: { type: 'string' },
            verification_steps: { type: 'array', items: { type: 'string' } }
          }
        }
      });
      
      setFixCode(fixSolution);
    } catch (err) {
      console.error('Fix generation error:', err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadFix = () => {
    if (!fixCode) return;
    
    const content = `# Automated Security Fix
    
## Vulnerability: ${selectedVuln.title}

### Changes Summary
${fixCode.changes_summary}

### Fixed Code
\`\`\`
${fixCode.fixed_code}
\`\`\`

### Dependencies
${fixCode.dependencies?.map(dep => `- ${dep}`).join('\n') || 'None'}

### Test Code
\`\`\`
${fixCode.test_code}
\`\`\`

### Verification Steps
${fixCode.verification_steps?.map((step, i) => `${i + 1}. ${step}`).join('\n')}
`;

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fix-${selectedVuln.title.replace(/\s+/g, '-').toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
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
            <Zap className="h-8 w-8 text-red-500" />
            Automated Vulnerability Remediation
          </h1>
          <p className="text-gray-400 mt-2">AI-powered automatic code fixes for security vulnerabilities</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vulnerabilities List */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Detected Vulnerabilities</CardTitle>
                <p className="text-sm text-gray-400">{allVulnerabilities.length} vulnerabilities found</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {allVulnerabilities.length === 0 ? (
                    <div className="text-center py-12">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-gray-400">No vulnerabilities to fix</p>
                      <p className="text-sm text-gray-500 mt-2">Run a security scan to find issues</p>
                    </div>
                  ) : (
                    allVulnerabilities.map((vuln, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          selectedVuln === vuln
                            ? 'border-red-500 bg-red-500/5'
                            : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedVuln(vuln)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-white text-sm">{vuln.title}</h4>
                          <Badge className={`${getSeverityColor(vuln.severity)} border text-xs`}>
                            {vuln.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">{vuln.scanType} - {vuln.targetName}</p>
                        <div className="flex gap-2">
                          {vuln.cwe_id && (
                            <Badge variant="outline" className="text-xs">{vuln.cwe_id}</Badge>
                          )}
                          {vuln.cve_id && (
                            <Badge variant="outline" className="text-xs">{vuln.cve_id}</Badge>
                          )}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fix Generation */}
          <div>
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Automated Fix</CardTitle>
                  {fixCode && (
                    <Button
                      onClick={downloadFix}
                      variant="outline"
                      size="sm"
                      className="border-gray-600"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {!selectedVuln ? (
                  <div className="text-center py-20">
                    <Code className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">Select a vulnerability to generate a fix</p>
                  </div>
                ) : !fixCode ? (
                  <div className="text-center py-12">
                    <div className="mb-6">
                      <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-white mb-2">{selectedVuln.title}</h3>
                      <Badge className={`${getSeverityColor(selectedVuln.severity)} border`}>
                        {selectedVuln.severity}
                      </Badge>
                    </div>
                    <Button
                      onClick={() => generateFix(selectedVuln)}
                      disabled={generating}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      {generating ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating Fix...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Generate Automated Fix
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-white mb-2">Changes Summary</h4>
                      <p className="text-sm text-gray-300">{fixCode.changes_summary}</p>
                    </div>

                    <Tabs defaultValue="code">
                      <TabsList className="bg-gray-900">
                        <TabsTrigger value="code">Fixed Code</TabsTrigger>
                        <TabsTrigger value="tests">Tests</TabsTrigger>
                        <TabsTrigger value="verify">Verification</TabsTrigger>
                      </TabsList>

                      <TabsContent value="code" className="space-y-4">
                        {fixCode.dependencies?.length > 0 && (
                          <div>
                            <h5 className="text-sm font-semibold text-white mb-2">Dependencies</h5>
                            <div className="bg-gray-900 p-3 rounded-lg">
                              {fixCode.dependencies.map((dep, i) => (
                                <div key={i} className="text-xs text-gray-300 font-mono">{dep}</div>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <h5 className="text-sm font-semibold text-white mb-2">Secure Implementation</h5>
                          <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300">
                            <code>{fixCode.fixed_code}</code>
                          </pre>
                        </div>
                      </TabsContent>

                      <TabsContent value="tests">
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs text-gray-300">
                          <code>{fixCode.test_code}</code>
                        </pre>
                      </TabsContent>

                      <TabsContent value="verify">
                        <div className="space-y-2">
                          {fixCode.verification_steps?.map((step, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                              <span className="font-bold text-red-500">{i + 1}.</span>
                              <span>{step}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}