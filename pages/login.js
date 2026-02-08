import React, { useEffect, useState } from 'react';
import { ironroot } from '@/lib/ironrootClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/useAuth';

export default function LoginPage() {
  const { user, org } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [setup, setSetup] = useState({ orgName: '', email: '', password: '', plan: 'paid' });
  const [needsSetup, setNeedsSetup] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({ email: '', reason: '' });
  const [requestStatus, setRequestStatus] = useState('');

  useEffect(() => {
    const check = async () => {
      const required = await ironroot.auth.needsSetup();
      setNeedsSetup(required);
    };
    check();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSetupChange = (e) => {
    setSetup((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRequestChange = (e) => {
    setRequestForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ironroot.auth.login({ email: form.email, password: form.password });
      window.location.href = '/';
    } catch (err) {
      setError(err?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await ironroot.auth.bootstrapAdmin({
        email: setup.email,
        password: setup.password,
        orgName: setup.orgName,
        plan: setup.plan,
      });
      window.location.href = '/adminDashboard';
    } catch (err) {
      setError(err?.message || 'Setup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetDemo = async () => {
    setLoading(true);
    try {
      await ironroot.auth.resetDemo();
      setNeedsSetup(true);
      setForm({ email: '', password: '' });
      setSetup({ orgName: '', email: '', password: '', plan: 'paid' });
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestAdmin = async (e) => {
    e.preventDefault();
    setRequestStatus('');
    try {
      await ironroot.users.requestAdminAccess({
        email: requestForm.email,
        reason: requestForm.reason,
      });
      setRequestStatus('submitted');
      setRequestForm({ email: '', reason: '' });
    } catch (err) {
      setRequestStatus('error');
    }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="section-header">
          <h1 className="title-lg">Sign in to Ironroot</h1>
          <p className="text-lead">Access advanced scanning, threat intel, and admin workflows.</p>
        </div>

        {user && user.role !== 'guest' && (
          <div className="card card--glass" style={{ marginBottom: '16px' }}>
            <p className="card__meta">Signed in as {user.email}</p>
            {org && <p className="card__meta">Organization: {org.name}</p>}
            <Button variant="ghost" style={{ marginTop: '12px' }} onClick={() => ironroot.auth.logout()}>
              Log out
            </Button>
          </div>
        )}

        {needsSetup ? (
          <form onSubmit={handleSetup} className="card card--glass" style={{ display: 'grid', gap: '16px' }}>
            <h3 className="card__title">Create Owner Account</h3>
            <p className="card__meta">No owner account found yet. Create the primary owner to unlock the platform.</p>
            <div>
              <label className="card__meta">Organization Name</label>
              <Input name="orgName" value={setup.orgName} onChange={handleSetupChange} required />
            </div>
            <div>
              <label className="card__meta">Owner Email</label>
              <Input name="email" value={setup.email} onChange={handleSetupChange} required />
            </div>
            <div>
              <label className="card__meta">Password</label>
              <Input name="password" type="password" value={setup.password} onChange={handleSetupChange} required />
              <p className="text-xs text-gray-500 mt-2">Minimum 10 characters, include 1 uppercase letter and 1 number.</p>
            </div>
            <div>
              <label className="card__meta">Plan</label>
              <select className="select" name="plan" value={setup.plan} onChange={handleSetupChange}>
                <option value="paid">Paid</option>
                <option value="trial">Trial</option>
              </select>
            </div>
            {error && <div className="alert">{error}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating…' : 'Create Owner'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetDemo} disabled={loading}>
              Reset Demo Data
            </Button>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="card card--glass" style={{ display: 'grid', gap: '16px' }}>
            <div>
              <label className="card__meta">Email</label>
              <Input name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div>
              <label className="card__meta">Password</label>
              <Input name="password" type="password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <div className="alert">{error}</div>}
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
            <Button type="button" variant="ghost" onClick={handleResetDemo} disabled={loading}>
              Reset Demo Data
            </Button>
          </form>
        )}

        <form onSubmit={handleRequestAdmin} className="card card--glass" style={{ display: 'grid', gap: '12px', marginTop: '18px' }}>
          <h3 className="card__title">Request Admin Access</h3>
          <p className="card__meta">Admin rights are granted by the owner. Submit a request and we will review it.</p>
          <div>
            <label className="card__meta">Email</label>
            <Input name="email" value={requestForm.email} onChange={handleRequestChange} required />
          </div>
          <div>
            <label className="card__meta">Reason</label>
            <Input name="reason" value={requestForm.reason} onChange={handleRequestChange} placeholder="Why you need admin access" />
          </div>
          {requestStatus === 'submitted' && (
            <div className="alert">Request submitted. The owner will review shortly.</div>
          )}
          {requestStatus === 'error' && (
            <div className="alert">Unable to submit request. Try again.</div>
          )}
          <Button type="submit">Submit Request</Button>
        </form>
      </div>
    </div>
  );
}
