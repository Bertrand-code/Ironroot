import crypto from 'crypto';
import { ensureOrgConfig, loadServerStore, saveServerStore } from '@/lib/serverStore';

export default function handler(req, res) {
  const store = loadServerStore();

  if (req.method === 'GET') {
    const { orgId, status } = req.query;
    let requests = store.watermarkRequests || [];
    if (orgId) {
      requests = requests.filter((item) => item.orgId === orgId);
    }
    if (status) {
      requests = requests.filter((item) => item.status === status);
    }
    return res.status(200).json({ ok: true, requests });
  }

  if (req.method === 'POST') {
    const { orgId, ownerEmail, requesterEmail, filename, fileHash } = req.body || {};
    if (!orgId || !requesterEmail) {
      return res.status(400).json({ ok: false, error: 'orgId and requesterEmail are required' });
    }
    ensureOrgConfig(store, orgId, ownerEmail);
    const request = {
      id: crypto.randomUUID ? crypto.randomUUID() : `req_${crypto.randomBytes(8).toString('hex')}`,
      orgId,
      requesterEmail,
      filename: filename || 'unknown',
      fileHash: fileHash || null,
      status: 'pending',
      created_date: new Date().toISOString(),
    };
    store.watermarkRequests.unshift(request);
    saveServerStore(store);
    return res.status(201).json({ ok: true, request });
  }

  if (req.method === 'PUT') {
    const { id, status, approvedBy } = req.body || {};
    if (!id || !status) {
      return res.status(400).json({ ok: false, error: 'id and status are required' });
    }
    const requests = store.watermarkRequests || [];
    const index = requests.findIndex((item) => item.id === id);
    if (index < 0) {
      return res.status(404).json({ ok: false, error: 'Request not found' });
    }
    requests[index] = {
      ...requests[index],
      status,
      approvedBy: approvedBy || 'owner',
      approvedAt: new Date().toISOString(),
    };
    store.watermarkRequests = requests;
    saveServerStore(store);
    return res.status(200).json({ ok: true, request: requests[index] });
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

