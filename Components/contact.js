import React, { useState } from 'react';
import { secpro } from '@/lib/secproClient';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      await secpro.entities.Lead.create(formData);
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
    <section id="contact" className="section">
      <div className="container" style={{ maxWidth: '1000px' }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.5 }}
          className="section-header"
        >
          <h2 className="title-lg">Get in Touch</h2>
          <p className="text-lead">Ready to secure your enterprise? Contact our team for a personalized consultation and demo.</p>
        </motion.div>
        
        <div>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8 }}
            className="card card--glass"
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
                <select
                  className="select"
                  value={formData.service}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Service of Interest *
                  </option>
                  <option value="ai_security">AI Security</option>
                  <option value="code_scanning">Code Scanning</option>
                  <option value="api_security">API Security</option>
                  <option value="grc_compliance">GRC & Compliance</option>
                  <option value="offensive_security">Offensive Security</option>
                  <option value="defensive_security">Defensive Security</option>
                  <option value="full_platform">Full Platform</option>
                </select>
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
