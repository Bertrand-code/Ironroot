import crypto from 'crypto';
import { loadServerStore, saveServerStore } from '@/lib/serverStore';

const hashEvent = (payload, prevHash) => {
  const hash = crypto.createHash('sha256');
  hash.update(JSON.stringify(payload));
  hash.update(prevHash || '');
  return hash.digest('hex');
};

const appendEvent = ({ store, orgId, actorEmail, action, metadata, severity, source }) => {
  const timestamp = new Date().toISOString();
  const eventCore = {
    id: crypto.randomUUID ? crypto.randomUUID() : `audit_${crypto.randomBytes(8).toString('hex')}`,
    orgId,
    actorEmail: actorEmail || 'unknown',
    action,
    metadata: metadata || {},
    severity: severity || 'info',
    source: source || 'ui',
    timestamp,
  };
  const prevHash = store.auditHeads?.[orgId] || null;
  const hash = hashEvent(eventCore, prevHash);
  const event = { ...eventCore, prevHash, hash };
  store.auditEvents = [event, ...(store.auditEvents || [])];
  store.auditHeads = { ...(store.auditHeads || {}), [orgId]: hash };
  return event;
};

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { orgId, limit } = req.query;
    if (!orgId) {
      return res.status(400).json({ ok: false, error: 'orgId is required' });
    }
    const store = loadServerStore();
    const events = (store.auditEvents || []).filter((event) => event.orgId === orgId);
    const capped = limit ? events.slice(0, Number(limit)) : events;
    return res.status(200).json({ ok: true, events: capped });
  }

  if (req.method === 'POST') {
    const { orgId, actorEmail, action, metadata, severity, source } = req.body || {};
    if (!orgId || !action) {
      return res.status(400).json({ ok: false, error: 'orgId and action are required' });
    }
    const store = loadServerStore();
    const event = appendEvent({ store, orgId, actorEmail, action, metadata, severity, source });
    saveServerStore(store);
    return res.status(200).json({ ok: true, event });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
