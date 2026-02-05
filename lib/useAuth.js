import { useEffect, useState } from 'react';
import { ironroot } from '@/lib/ironrootClient';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [org, setOrg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const currentUser = await ironroot.auth.me();
        const currentOrg = await ironroot.auth.currentOrg();
        if (mounted) {
          setUser(currentUser);
          setOrg(currentOrg);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();

    const interval = setInterval(() => {
      ironroot.auth.touchSession();
    }, 60000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return { user, org, loading };
};
