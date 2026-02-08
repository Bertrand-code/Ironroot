import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Header from './components/Header';
import Footer from './components/Footer';
import AIChatWidget from './components/AIChatWidget';
import SecurityOverlay from './components/SecurityOverlay';
import { useAuth } from '@/lib/useAuth';
import { ironroot } from '@/lib/ironrootClient';

const SENSITIVE_PATHS = [
  '/documentVault',
  '/controlCenter',
  '/adminDashboard',
  '/userManagement',
  '/threatIntelligence',
  '/codeScanner',
  '/reportCenter',
  '/assetInventory',
  '/riskRegister',
  '/offensiveDashboard',
  '/defensiveDashboard',
  '/apiSecurity',
  '/aiAssistant',
  '/threatReport',
  '/adminNotepad',
];

export default function Layout({ children }) {
  const router = useRouter();
  const { user, org } = useAuth();
  const lastSignalRef = useRef(0);
  const [sessionTag] = useState(() => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID().slice(0, 8).toUpperCase();
    }
    return Math.random().toString(36).slice(2, 10).toUpperCase();
  });
  const [timestamp, setTimestamp] = useState(() => new Date());

  const isSensitiveView = useMemo(() => {
    const path = router?.pathname || '';
    return SENSITIVE_PATHS.some((prefix) => path.startsWith(prefix));
  }, [router?.pathname]);

  const screenWatermarkingEnabled = !!org?.security?.screenWatermarkingEnabled && isSensitiveView;
  const secureViewEnabled = !!org?.security?.secureViewMode && isSensitiveView;
  const captureSignalsEnabled = !!org?.security?.captureSignalsEnabled && isSensitiveView;

  useEffect(() => {
    if (!secureViewEnabled) {
      document.body.classList.remove('secure-view');
      return;
    }
    document.body.classList.add('secure-view');
    return () => {
      document.body.classList.remove('secure-view');
    };
  }, [secureViewEnabled]);

  useEffect(() => {
    if (!screenWatermarkingEnabled) return undefined;
    const interval = setInterval(() => setTimestamp(new Date()), 15000);
    return () => clearInterval(interval);
  }, [screenWatermarkingEnabled]);

  useEffect(() => {
    if (!captureSignalsEnabled) return undefined;
    if (!user || user.role === 'guest' || !org?.id) return undefined;

    const logSignal = async (reason, details = {}) => {
      const now = Date.now();
      if (now - lastSignalRef.current < 15000) return;
      lastSignalRef.current = now;
      const metadata = {
        reason,
        path: router?.pathname || '/',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        viewport: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'unknown',
        ...details,
      };
      await ironroot.integrations.Audit.log({
        orgId: org.id,
        actorEmail: user.email || 'unknown',
        action: 'screen_capture_signal',
        metadata,
        severity: 'warning',
        source: 'client',
      });
      if (['owner', 'admin'].includes(user.role)) {
        await ironroot.entities.ActivityLog.create({
          userEmail: user.email || 'unknown',
          action: 'screen_capture_signal',
          details: metadata,
          timestamp: new Date().toISOString(),
        });
      }
    };

    const onKeyDown = (event) => {
      const key = event.key;
      const isPrintScreen = key === 'PrintScreen' || key === 'PrtSc' || key === 'PrtScn';
      const isMacCapture = event.metaKey && event.shiftKey && ['3', '4', '5'].includes(key);
      if (isPrintScreen || isMacCapture) {
        logSignal('key_capture', { key, metaKey: event.metaKey, shiftKey: event.shiftKey });
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        logSignal('visibility_hidden');
      }
    };

    const onBlur = () => {
      logSignal('window_blur');
    };

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [captureSignalsEnabled, org?.id, router?.pathname, user]);

  const watermarkLabel = useMemo(() => {
    const email = user?.email || 'unknown';
    const orgName = org?.name || 'unassigned';
    return `${email} • ${orgName} • ${sessionTag} • ${timestamp.toLocaleTimeString()}`;
  }, [org?.name, sessionTag, timestamp, user?.email]);

  return (
    <div className="layout">
      <Header />
      <SecurityOverlay enabled={screenWatermarkingEnabled} label={watermarkLabel} />
      <main className={secureViewEnabled ? 'secure-view__content' : undefined}>{children}</main>
      <Footer />
      <AIChatWidget />
    </div>
  );
}
