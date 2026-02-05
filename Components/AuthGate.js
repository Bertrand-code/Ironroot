import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/useAuth';

export default function AuthGate({
  children,
  title = 'Sign in required',
  description = 'Log in to access this advanced feature.',
  roles = [],
  plans = [],
  feature = null,
  ownerOnly = false,
}) {
  const { user, org, loading } = useAuth();

  if (loading) return null;

  const isOwner = user?.role === 'owner' || (org?.ownerEmail && user?.email === org.ownerEmail);
  const isAdmin = user?.role === 'admin' || isOwner;
  const roleAllowed = roles.length
    ? roles.includes(user?.role) || (roles.includes('admin') && isOwner) || (roles.includes('owner') && isOwner)
    : user?.role !== 'guest';
  const planAllowed = plans.length ? plans.includes(org?.plan) : true;
  const featureAllowed = feature ? !!org?.features?.[feature] : true;
  const allowed = isOwner || (!ownerOnly && (isAdmin || (roleAllowed && planAllowed && featureAllowed)));

  if (!allowed) {
    return (
      <div className="card card--glass" style={{ padding: '28px' }}>
        <h3 className="card__title">{title}</h3>
        <p className="card__meta" style={{ marginTop: '8px' }}>{description}</p>
        <Button style={{ marginTop: '16px' }} onClick={() => (window.location.href = '/login')}>
          Log In
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}
