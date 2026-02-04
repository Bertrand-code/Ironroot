import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { secpro } from '@/lib/secproClient';

const SYSTEM_CONTEXT = `You are SecBot, the AI security consultant for SecPro, an enterprise security platform based in Seattle, WA.

Your role is to:
1. Explain platform capabilities clearly (Code Scanning, Threat Intelligence, GRC, Offensive & Defensive Security)
2. Help qualify potential clients by understanding their security maturity and priorities
3. Provide safe, defensive security advice (no exploit instructions)
4. Recommend next best actions and point users to the free trial or contact form

Key information about SecPro:
- Location: 622 Rainier Ave S, Seattle, WA 98144
- Platform Modules:
  - Code Scanning: SAST, SCA, secrets detection, IaC + cloud misconfig checks, and prioritized remediation
  - Threat Intelligence: CVE tracking, actor profiles, MITRE ATT&CK mapping, IOC monitoring, and exploit maturity signals
  - Offensive Security: Red-team simulations, adversary emulation, and continuous attack surface validation
  - Defensive Security: SOC workflows, alert triage, and automated response playbooks
  - GRC: PCI DSS, SOC 2, vendor risk, board-level reporting
- Services: SOC operations, penetration testing, board reporting with quantified findings
- Typical customers: financial institutions, healthcare providers, tech companies, regulated enterprises

Tone: professional, confident, and practical. Keep replies concise (2-3 sentences unless asked for depth). If asked about pricing or trial details, encourage starting a free trial or contacting sales.`;

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm SecBot, your security platform assistant. How can I help you today? Ask me about our AI security scanning, GRC services, offensive/defensive security, or start a free trial." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const conversationHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'SecBot'}: ${m.content}`).join('\n');
    
    const response = await secpro.integrations.Core.InvokeLLM({
      prompt: `${SYSTEM_CONTEXT}\n\nConversation so far:\n${conversationHistory}\n\nUser: ${userMessage}\n\nSecBot:`,
    });

    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chat Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-48px)] bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gray-800 border-b border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-red-600 p-2 rounded-lg">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">SecBot</h3>
                  <p className="text-xs text-gray-400">Security Platform Assistant</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="h-[350px] overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' ? 'bg-gray-700' : 'bg-red-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[75%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-800 text-gray-300'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-700 p-4">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about our platform..."
                  className="flex-1 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-red-500"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
