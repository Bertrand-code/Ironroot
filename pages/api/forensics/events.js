import { loadServerStore } from '@/lib/serverStore';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { orgId, limit } = req.query;
  const store = loadServerStore();
  let events = store.watermarkEvents || [];
  if (orgId) {
    events = events.filter((event) => event.orgId === orgId);
  }
  const safeLimit = limit ? Number(limit) : null;
  if (safeLimit && !Number.isNaN(safeLimit)) {
    events = events.slice(0, safeLimit);
  }
  return res.status(200).json({ ok: true, events });
}

