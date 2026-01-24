import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, ArrowLeft, Lightbulb, Code, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';

export default function CourseLab() {
  const location = useLocation();
  const courseId = new URLSearchParams(location.search).get('id');
  
  const [currentStep, setCurrentStep] = useState(0);
  const [userCode, setUserCode] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [completed, setCompleted] = useState(false);

  const courses = {
    'sql-injection': {
      title: 'SQL Injection Prevention',
      description: 'Learn to identify and prevent SQL injection vulnerabilities',
      steps: [
        {
          title: 'Understanding SQL Injection',
          content: `SQL Injection is one of the most dangerous web vulnerabilities. Attackers can inject malicious SQL code into your queries.

**Example Vulnerable Code:**
\`\`\`javascript
const username = req.body.username;
const query = "SELECT * FROM users WHERE username = '" + username + "'";
db.query(query);
\`\`\`

**Attack Vector:**
If an attacker enters: \`admin' OR '1'='1\`
The query becomes: \`SELECT * FROM users WHERE username = 'admin' OR '1'='1'\`

This bypasses authentication!`,
          type: 'lesson'
        },
        {
          title: 'Lab: Fix SQL Injection',
          content: `Fix the vulnerable login function below using parameterized queries.

**Your Task:** Replace the string concatenation with a secure parameterized query.`,
          vulnerableCode: `function login(username, password) {
  const query = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "'";
  return db.query(query);
}`,
          solution: `function login(username, password) {
  const query = "SELECT * FROM users WHERE username = ? AND password = ?";
  return db.query(query, [username, password]);
}`,
          type: 'lab',
          hint: 'Use parameterized queries with ? placeholders'
        },
        {
          title: 'Lab: Secure Database Query',
          content: `Create a secure search function that prevents SQL injection.`,
          vulnerableCode: `function searchProducts(searchTerm) {
  const query = "SELECT * FROM products WHERE name LIKE '%" + searchTerm + "%'";
  return db.query(query);
}`,
          solution: `function searchProducts(searchTerm) {
  const query = "SELECT * FROM products WHERE name LIKE ?";
  return db.query(query, ['%' + searchTerm + '%']);
}`,
          type: 'lab',
          hint: 'Parameterize the LIKE clause'
        }
      ]
    },
    'xss-defense': {
      title: 'Cross-Site Scripting (XSS) Defense',
      description: 'Master XSS attack vectors and prevention',
      steps: [
        {
          title: 'Understanding XSS',
          content: `XSS allows attackers to inject malicious scripts into web pages viewed by other users.

**Vulnerable Code:**
\`\`\`javascript
document.getElementById('output').innerHTML = userInput;
\`\`\`

**Attack:** \`<script>alert('XSS')</script>\``,
          type: 'lesson'
        },
        {
          title: 'Lab: Fix XSS Vulnerability',
          content: `Secure the function to prevent XSS attacks by properly encoding output.`,
          vulnerableCode: `function displayComment(comment) {
  document.getElementById('comments').innerHTML += "<div>" + comment + "</div>";
}`,
          solution: `function displayComment(comment) {
  const div = document.createElement('div');
  div.textContent = comment; // textContent auto-escapes
  document.getElementById('comments').appendChild(div);
}`,
          type: 'lab',
          hint: 'Use textContent or createElement instead of innerHTML'
        }
      ]
    },
    'secure-auth': {
      title: 'Secure Authentication',
      steps: [
        {
          title: 'Password Hashing',
          content: `Never store passwords in plain text. Always use strong hashing algorithms.`,
          type: 'lesson'
        },
        {
          title: 'Lab: Implement Secure Password Storage',
          vulnerableCode: `function saveUser(username, password) {
  db.insert({ username, password });
}`,
          solution: `const bcrypt = require('bcrypt');

async function saveUser(username, password) {
  const hashedPassword = await bcrypt.hash(password, 10);
  db.insert({ username, password: hashedPassword });
}`,
          type: 'lab',
          hint: 'Use bcrypt to hash passwords'
        }
      ]
    }
  };

  const course = courses[courseId] || courses['sql-injection'];
  const step = course.steps[currentStep];

  const checkSolution = () => {
    const normalized = userCode.replace(/\s+/g, ' ').trim();
    const solutionNormalized = step.solution?.replace(/\s+/g, ' ').trim();
    
    if (normalized.includes('?') && !normalized.includes("' +") && !normalized.includes('+ "')) {
      setTestResult({ success: true, message: 'Excellent! Your code is secure.' });
      if (currentStep === course.steps.length - 1) {
        setCompleted(true);
      }
    } else {
      setTestResult({ success: false, message: 'Still vulnerable. Check the hint!' });
    }
  };

  const nextStep = () => {
    if (currentStep < course.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setUserCode('');
      setTestResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="mb-6">
          <Link to={createPageUrl('SecurityTraining')}>
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Courses
            </Button>
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
          <p className="text-gray-400">{course.description}</p>
          <div className="mt-4 flex gap-2">
            {course.steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full ${
                  idx <= currentStep ? 'bg-red-600' : 'bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>

        {step.type === 'lesson' ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-gray-300">{step.content}</pre>
              </div>
              <Button onClick={nextStep} className="mt-6 bg-red-600 hover:bg-red-700">
                Next Step
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  {step.title}
                </CardTitle>
                <p className="text-gray-400 text-sm">{step.content}</p>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Vulnerable Code:
                  </label>
                  <pre className="bg-red-500/10 border border-red-500/30 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                    <code>{step.vulnerableCode}</code>
                  </pre>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-semibold text-gray-300 mb-2 block">
                    Your Secure Solution:
                  </label>
                  <Textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="bg-gray-900 border-gray-700 text-white font-mono text-sm h-40"
                    placeholder="Write your secure code here..."
                  />
                </div>

                {step.hint && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-yellow-500">Hint:</p>
                        <p className="text-sm text-gray-300">{step.hint}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={checkSolution}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Test Solution
                  </Button>
                  {testResult?.success && (
                    <Button onClick={nextStep} className="bg-red-600 hover:bg-red-700">
                      Next Challenge
                    </Button>
                  )}
                </div>

                {testResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-4 p-4 rounded-lg border ${
                      testResult.success
                        ? 'bg-green-500/10 border-green-500/30'
                        : 'bg-red-500/10 border-red-500/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {testResult.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <p className={testResult.success ? 'text-green-400' : 'text-red-400'}>
                        {testResult.message}
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {completed && (
              <Card className="bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-500/30">
                <CardContent className="pt-6 text-center">
                  <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Course Completed! 🎉</h3>
                  <p className="text-gray-300 mb-4">You've mastered {course.title}</p>
                  <Link to={createPageUrl('SecurityTraining')}>
                    <Button className="bg-red-600 hover:bg-red-700">
                      Back to Training Academy
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}