import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ironroot } from '@/lib/ironrootClient';

export default function InvitePage() {
  const router = useRouter();
  const [status, setStatus] = useState('loading');
  const [invite, setInvite] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!router.isReady) return;
    const { token } = router.query;
    const loadInvite = async () => {
      if (!token || typeof token !== 'string') {
        setStatus('invalid');
        return;
      }
      const record = await ironroot.users.getInviteByToken(token);
      if (!record || record.invalid) {
        setStatus('invalid');
        return;
      }
      if (record.expired) {
        setStatus('expired');
        return;
      }
      setInvite(record);
      setStatus('ready');
    };
    loadInvite();
  }, [router.isReady, router.query]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!invite?.token) return;
    setError('');
    setSuccess('');
    try {
      await ironroot.users.acceptInvite({ token: invite.token, password });
      setSuccess('Password set successfully. Redirecting to login...');
      setTimeout(() => {
        router.push('/login');
      }, 1200);
    } catch (err) {
      setError(err?.message || 'Unable to accept invite.');
    }
  };

  return (
    <div className="section">
      <div className="container" style={{ maxWidth: '520px' }}>
        <div className="section-header">
          <h1 className="title-lg">Accept Invitation</h1>
          <p className="text-lead">Create your Ironroot password to activate your account.</p>
        </div>

        {status === 'loading' && (
          <div className="card card--glass">Loading invitation…</div>
        )}

        {status === 'invalid' && (
          <div className="card card--glass">
            <p className="card__meta">Invite link is invalid. Request a new invite from your administrator.</p>
          </div>
        )}

        {status === 'expired' && (
          <div className="card card--glass">
            <p className="card__meta">Invite link expired. Request a new invite from your administrator.</p>
          </div>
        )}

        {status === 'ready' && (
          <form onSubmit={handleSubmit} className="card card--glass" style={{ display: 'grid', gap: '16px' }}>
            <p className="card__meta">
              Invited email: <strong>{invite.email}</strong>
            </p>
            <div>
              <label className="card__meta">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Password must be at least 10 characters with 1 uppercase letter and 1 number.
              </p>
            </div>
            {error && <div className="alert">{error}</div>}
            {success && <div className="alert">{success}</div>}
            <Button type="submit">Set Password</Button>
          </form>
        )}
      </div>
    </div>
  );
}
