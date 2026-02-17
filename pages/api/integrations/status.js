import { INTEGRATIONS } from '@/lib/integrationsRegistry';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const demoMode = process.env.IRONROOT_DEMO_INTEGRATIONS === 'true';
  const payload = INTEGRATIONS.map((integration) => {
    const auth = integration.auth || {};
    let liveEnabled = false;
    if (auth.type === 'basic') {
      liveEnabled = !!(process.env[auth.envId] && process.env[auth.envSecret]);
    } else if (auth.env) {
      const primary = process.env[auth.env];
      const fallback = auth.envFallback ? process.env[auth.envFallback] : null;
      liveEnabled = !!(primary || fallback);
    } else {
      liveEnabled = true;
    }
    const enabled = demoMode ? true : liveEnabled;
    const mode = liveEnabled ? 'live' : demoMode ? 'demo' : 'off';
    return {
      id: integration.id,
      label: integration.label,
      category: integration.category,
      enabled,
      mode,
    };
  });

  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).json(payload);
}
