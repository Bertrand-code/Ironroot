import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GitBranch, Github, GitlabIcon as GitLab, Code, Copy, CheckCircle } from 'lucide-react';

export default function CICDIntegration() {
  const [copied, setCopied] = useState(null);
  const [notice, setNotice] = useState('');

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setNotice('Copied to clipboard.');
    setTimeout(() => setCopied(null), 2000);
    setTimeout(() => setNotice(''), 2500);
  };

  const githubAction = `name: Ironroot Security Scan

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Run Ironroot Security Scan
      run: |
        curl -X POST https://api.ironroot.com/scan \\
          -H "Authorization: Bearer \${{ secrets.IRONROOT_API_KEY }}" \\
          -H "Content-Type: application/json" \\
          -d '{
            "repository": "\${{ github.repository }}",
            "branch": "\${{ github.ref }}",
            "scan_type": "full"
          }'
    
    - name: Upload Results
      if: always()
      uses: actions/upload-artifact@v3
      with:
        name: security-scan-results
        path: ironroot-results.json`;

  const gitlabCI = `stages:
  - security

ironroot-security-scan:
  stage: security
  image: alpine:latest
  before_script:
    - apk add --no-cache curl jq
  script:
    - |
      curl -X POST https://api.ironroot.com/scan \\
        -H "Authorization: Bearer \${IRONROOT_API_KEY}" \\
        -H "Content-Type: application/json" \\
        -d "{
          \\"repository\\": \\"\${CI_PROJECT_URL}\\",
          \\"branch\\": \\"\${CI_COMMIT_BRANCH}\\",
          \\"scan_type\\": \\"full\\"
        }" \\
        -o ironroot-results.json
  artifacts:
    reports:
      junit: ironroot-results.json
    when: always
  only:
    - main
    - develop
    - merge_requests`;

  const jenkinsfile = [
    'pipeline {',
    '    agent any',
    '',
    '    environment {',
    "        IRONROOT_API_KEY = credentials('ironroot-api-key')",
    '    }',
    '',
    '    stages {',
    "        stage('Security Scan') {",
    '            steps {',
    '                script {',
    "                    sh '''",
    '                        curl -X POST https://api.ironroot.com/scan \\',
    '                          -H "Authorization: Bearer ${IRONROOT_API_KEY}" \\',
    '                          -H "Content-Type: application/json" \\',
    '                          -d \'{"repository":"${GIT_URL}","branch":"${GIT_BRANCH}","scan_type":"full"}\' \\',
    '                          -o ironroot-results.json',
    "                    '''",
    '                }',
    '            }',
    '        }',
    '',
    "        stage('Publish Results') {",
    '            steps {',
    "                archiveArtifacts artifacts: 'ironroot-results.json', fingerprint: true",
    '                publishHTML([',
    "                    reportDir: '.',",
    "                    reportFiles: 'ironroot-results.json',",
    "                    reportName: 'Ironroot Security Scan'",
    '                ])',
    '            }',
    '        }',
    '    }',
    '',
    '    post {',
    '        failure {',
    "            mail to: 'security@company.com',",
    '                 subject: "Security Scan Failed: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",',
    '                 body: "Check console output at ${env.BUILD_URL}"',
    '        }',
    '    }',
    '}',
  ].join('\n');

  const dockerConfig = `# Dockerfile for CI/CD Security Scanning
FROM alpine:latest

RUN apk add --no-cache curl jq bash

WORKDIR /app

COPY . .

CMD ["sh", "-c", "curl -X POST https://api.ironroot.com/scan -H 'Authorization: Bearer \${IRONROOT_API_KEY}' -d @scan-config.json"]`;

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <GitBranch className="h-8 w-8 text-red-500" />
            CI/CD Integration
          </h1>
          <p className="text-gray-400 mt-2">Integrate Ironroot security scanning into your CI/CD pipeline</p>
        </div>
        {notice && (
          <div className="mb-6 bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-3 rounded">
            {notice}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <Github className="h-12 w-12 text-white mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">GitHub Actions</h3>
              <p className="text-sm text-gray-400">Automated security scans on every push and PR</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <GitLab className="h-12 w-12 text-orange-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">GitLab CI/CD</h3>
              <p className="text-sm text-gray-400">Seamless integration with GitLab pipelines</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="pt-6">
              <Code className="h-12 w-12 text-blue-500 mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">Jenkins</h3>
              <p className="text-sm text-gray-400">Enterprise-grade Jenkins pipeline integration</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="github" className="mb-8">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="github">GitHub Actions</TabsTrigger>
            <TabsTrigger value="gitlab">GitLab CI</TabsTrigger>
            <TabsTrigger value="jenkins">Jenkins</TabsTrigger>
            <TabsTrigger value="docker">Docker</TabsTrigger>
          </TabsList>

          <TabsContent value="github">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">GitHub Actions Configuration</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(githubAction, 'github')}
                  >
                    {copied === 'github' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                  <code>{githubAction}</code>
                </pre>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>📁 Save this as <code className="text-blue-400">.github/workflows/ironroot-scan.yml</code></p>
                  <p>🔑 Add your Ironroot API key as a GitHub secret: <code className="text-blue-400">IRONROOT_API_KEY</code></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gitlab">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">GitLab CI Configuration</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(gitlabCI, 'gitlab')}
                  >
                    {copied === 'gitlab' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                  <code>{gitlabCI}</code>
                </pre>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>📁 Save this as <code className="text-blue-400">.gitlab-ci.yml</code></p>
                  <p>🔑 Add your Ironroot API key as a CI/CD variable: <code className="text-blue-400">IRONROOT_API_KEY</code></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jenkins">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Jenkins Pipeline Configuration</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(jenkinsfile, 'jenkins')}
                  >
                    {copied === 'jenkins' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                  <code>{jenkinsfile}</code>
                </pre>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>📁 Save this as <code className="text-blue-400">Jenkinsfile</code></p>
                  <p>🔑 Add your Ironroot API key as a Jenkins credential: <code className="text-blue-400">ironroot-api-key</code></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="docker">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-white">Docker Configuration</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(dockerConfig, 'docker')}
                  >
                    {copied === 'docker' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm text-gray-300">
                  <code>{dockerConfig}</code>
                </pre>
                <div className="mt-4 space-y-2 text-sm text-gray-400">
                  <p>🐳 Build: <code className="text-blue-400">docker build -t ironroot-scanner .</code></p>
                  <p>▶️ Run: <code className="text-blue-400">docker run -e IRONROOT_API_KEY=your_key ironroot-scanner</code></p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border-red-500/30">
          <CardContent className="pt-6">
            <h3 className="text-lg font-bold text-white mb-4">🔐 Security Best Practices</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>✅ Always store API keys as secrets/environment variables</li>
              <li>✅ Rotate API keys regularly (every 90 days recommended)</li>
              <li>✅ Use read-only tokens where possible</li>
              <li>✅ Enable scan result notifications via email/Slack</li>
              <li>✅ Set up automatic security gates to block vulnerable code from merging</li>
              <li>✅ Review scan results before deploying to production</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
