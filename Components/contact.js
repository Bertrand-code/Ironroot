import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    workEmail: '',
    phone: '',
    service: '',
    message: '',
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, service: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setError('');
    
    if (!formData.service) {
        setStatus('error');
        setError('Please select a service of interest.');
        return;
    }

    try {
      await base44.entities.Lead.create(formData);
      setStatus('success');
      setFormData({
        fullName: '',
        companyName: '',
        workEmail: '',
        phone: '',
        service: '',
        message: '',
      });
    } catch (err) {
      setStatus('error');
      setError('An error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <section id="contact" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white">Get in Touch</h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">Ready to secure your enterprise? Contact our team for a personalized consultation and demo.</p>
          <div className="mt-6 w-24 h-1 bg-red-500 mx-auto"></div>
        </motion.div>
        
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="bg-gray-800/50 p-8 rounded-lg border border-gray-700/50"
          >
            {status === 'success' ? (
                <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-300">
                    <CheckCircle className="h-5 w-5 text-green-400" />
                    <AlertDescription className="ml-2">
                        Thank you for your inquiry! Our team will be in touch shortly.
                    </AlertDescription>
                </Alert>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <Input name="fullName" placeholder="Full Name *" value={formData.fullName} onChange={handleChange} required className="bg-gray-900 border-gray-700 text-white focus:border-red-500" />
                <Input name="companyName" placeholder="Company Name *" value={formData.companyName} onChange={handleChange} required className="bg-gray-900 border-gray-700 text-white focus:border-red-500" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <Input name="workEmail" type="email" placeholder="Work Email *" value={formData.workEmail} onChange={handleChange} required className="bg-gray-900 border-gray-700 text-white focus:border-red-500" />
                <Input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} className="bg-gray-900 border-gray-700 text-white focus:border-red-500" />
              </div>
              <div>
                <Select onValueChange={handleSelectChange} value={formData.service}>
                  <SelectTrigger className="w-full bg-gray-900 border-gray-700 text-white focus:border-red-500">
                    <SelectValue placeholder="Service of Interest *" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="ai_security">AI Security</SelectItem>
                    <SelectItem value="code_scanning">Code Scanning</SelectItem>
                    <SelectItem value="api_security">API Security</SelectItem>
                    <SelectItem value="grc_compliance">GRC & Compliance</SelectItem>
                    <SelectItem value="offensive_security">Offensive Security</SelectItem>
                    <SelectItem value="defensive_security">Defensive Security</SelectItem>
                    <SelectItem value="full_platform">Full Platform</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Textarea name="message" placeholder="How can we help you?" value={formData.message} onChange={handleChange} className="bg-gray-900 border-gray-700 text-white focus:border-red-500 h-32" />
              </div>
               {status === 'error' && (
                    <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-300">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
              <div>
                <Button type="submit" disabled={status === 'loading'} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 text-base">
                  {status === 'loading' ? <Loader2 className="animate-spin" /> : <><Send className="mr-2 h-5 w-5" /> Submit Inquiry</>}
                </Button>
              </div>
            </form>
             )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}