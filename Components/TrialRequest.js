import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ironroot } from '@/lib/ironrootClient';
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
      await ironroot.entities.TrialRequest.create(formData);
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
    <section id="trial" className="section">
      <div className="container" style={{ maxWidth: '960px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="section-header"
        >
          <h2 className="title-lg">Start Your Free Trial</h2>
          <p className="text-lead">
            Experience the full power of Ironroot. No credit card required. Get instant access to all platform features.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card card--glass"
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
                  <select
                    className="select"
                    value={formData.interestedIn}
                    onChange={(e) => handleSelectChange('interestedIn', e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Select area
                    </option>
                    <option value="defensive_security">Defensive Security</option>
                    <option value="offensive_security">Offensive Security</option>
                    <option value="code_scanning">Code Scanning</option>
                    <option value="grc_services">GRC Services</option>
                    <option value="api_security">API Security</option>
                    <option value="full_platform">Full Platform</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Company Size
                  </label>
                  <select
                    className="select"
                    value={formData.companySize}
                    onChange={(e) => handleSelectChange('companySize', e.target.value)}
                  >
                    <option value="" disabled>
                      Select size
                    </option>
                    <option value="1-50">1-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-1000">201-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
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
