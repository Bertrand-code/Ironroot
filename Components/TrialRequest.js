import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function TrialRequest() {
  const [formData, setFormData] = useState({
    fullName: '',
    companyName: '',
    email: '',
    phone: '',
    interestedIn: '',
    companySize: '',
    message: '',
  });
  const [status, setStatus] = useState('idle');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.interestedIn) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    try {
      await base44.entities.TrialRequest.create(formData);
      setStatus('success');
      setFormData({
        fullName: '',
        companyName: '',
        email: '',
        phone: '',
        interestedIn: '',
        companySize: '',
        message: '',
      });
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section id="trial" className="py-20 md:py-32 bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-6 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Start Your Free Trial</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Experience the full power of SecPro. No credit card required. Get instant access to all platform features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-gray-800/50 p-8 rounded-xl border border-gray-700"
        >
          {status === 'success' ? (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">Request Submitted!</h3>
              <p className="text-gray-400 mb-6">
                We'll review your trial request and send you access credentials within 24 hours.
              </p>
              <Button onClick={() => setStatus('idle')} className="bg-red-600 hover:bg-red-700">
                Submit Another Request
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <Input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Work Email *
                  </label>
                  <Input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Name
                  </label>
                  <Input
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <Input
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="bg-gray-900 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Interested In *
                  </label>
                  <Select onValueChange={(value) => handleSelectChange('interestedIn', value)} required>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="defensive_security">Defensive Security</SelectItem>
                      <SelectItem value="offensive_security">Offensive Security</SelectItem>
                      <SelectItem value="code_scanning">Code Scanning</SelectItem>
                      <SelectItem value="grc_services">GRC Services</SelectItem>
                      <SelectItem value="api_security">API Security</SelectItem>
                      <SelectItem value="full_platform">Full Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size
                  </label>
                  <Select onValueChange={(value) => handleSelectChange('companySize', value)}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-50">1-50 employees</SelectItem>
                      <SelectItem value="51-200">51-200 employees</SelectItem>
                      <SelectItem value="201-1000">201-1000 employees</SelectItem>
                      <SelectItem value="1000+">1000+ employees</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tell us about your security needs
                </label>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  className="bg-gray-900 border-gray-700 text-white h-32"
                />
              </div>

              {status === 'error' && (
                <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded">
                  Please fill in all required fields.
                </div>
              )}

              <Button
                type="submit"
                disabled={status === 'loading'}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg"
              >
                {status === 'loading' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}