import React, { useState, useEffect, useRef } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Brain, Send, Loader2, Sparkles, Shield, Code, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function AISecurityAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: '👋 Hi! I\'m Vansh, your AI Security Assistant. I can help you with:\n\n• **Vulnerability Analysis** - Explain security findings\n• **Remediation Guidance** - How to fix security issues\n• **Security Best Practices** - OWASP, secure coding\n• **Threat Intelligence** - Latest CVEs and exploits\n• **Compliance Questions** - PCI DSS, SOC 2, HIPAA\n\nWhat security question can I help you with today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickPrompts = [
    { icon: Shield, text: 'Explain SQL Injection', prompt: 'Explain SQL Injection vulnerabilities and how to prevent them' },
    { icon: Code, text: 'Secure Code Review', prompt: 'What are the top 10 things to check in a secure code review?' },
    { icon: FileText, text: 'OWASP Top 10', prompt: 'Explain the OWASP Top 10 2021 vulnerabilities' },
    { icon: Brain, text: 'Zero Trust Security', prompt: 'What is Zero Trust Security and how do I implement it?' },
  ];

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await ironroot.integrations.Core.InvokeLLM({
        prompt: `You are Vansh, a world-class cybersecurity expert and AI assistant specializing in application security, penetration testing, and secure coding practices. You have deep knowledge of:

- OWASP Top 10, CWE, CVE databases
- Penetration testing methodologies (PTES, OWASP Testing Guide)
- Secure coding in all major languages
- Cloud security (AWS, Azure, GCP)
- Compliance frameworks (PCI DSS, SOC 2, HIPAA, GDPR)
- Threat modeling and risk assessment
- Security tools (Burp Suite, Metasploit, Nmap, etc.)

Provide expert, actionable security advice. Include code examples when relevant. Be technical but clear. Do not speculate; say "unknown" if you are unsure. Start with a direct answer to the user's question.

User question: ${input}`,
        add_context_from_internet: true
      });

      const assistantMessage = { role: 'assistant', content: response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('AI Error:', err);
      const errorMessage = {
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please try again or rephrase your question.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (prompt) => {
    setInput(prompt);
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-full">
              <Brain className="h-12 w-12 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Vansh • AI Security Assistant</h1>
          <p className="text-gray-400">Expert cybersecurity guidance powered by advanced AI</p>
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-2 gap-4 mb-8"
          >
            {quickPrompts.map((prompt, idx) => (
              <Card
                key={idx}
                className="bg-gray-800 border-gray-700 cursor-pointer hover:border-red-500 transition-all"
                onClick={() => handleQuickPrompt(prompt.prompt)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-red-600/10 p-3 rounded-lg">
                      <prompt.icon className="h-6 w-6 text-red-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">{prompt.text}</h3>
                      <p className="text-xs text-gray-400">Click to ask</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}

        {/* Chat Messages */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardContent className="p-0">
            <div className="h-[500px] overflow-y-auto p-6 space-y-4">
              <AnimatePresence>
                {messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg p-4 ${
                        msg.role === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-900 text-gray-300 border border-gray-700'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-sm prose-invert max-w-none">
                          <ReactMarkdown
                            components={{
                              code: ({ inline, children }) =>
                                inline ? (
                                  <code className="bg-gray-800 px-1 py-0.5 rounded text-red-400">
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-gray-800 p-3 rounded-lg overflow-x-auto">
                                    <code className="text-gray-300">{children}</code>
                                  </pre>
                                ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                    <Loader2 className="h-5 w-5 text-red-500 animate-spin" />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                placeholder="Ask about vulnerabilities, security best practices, CVEs..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                className="bg-gray-900 border-gray-700 text-white"
                disabled={loading}
              />
              <Button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            💡 Powered by advanced AI with real-time threat intelligence and OWASP knowledge base
          </p>
        </div>
      </div>
    </div>
  );
}
