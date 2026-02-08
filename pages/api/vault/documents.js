import crypto from 'crypto';
import { ensureOrgConfig, loadServerStore, saveServerStore } from '@/lib/serverStore';
import { sha256Hex } from '@/lib/serverForensics';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default function handler(req, res) {
  const store = loadServerStore();

  if (req.method === 'GET') {
    const { orgId } = req.query;
    if (!orgId) {
      return res.status(400).json({ ok: false, error: 'orgId is required' });
    }
    const documents = (store.documents || []).filter((doc) => doc.orgId === orgId);
    return res.status(200).json({ ok: true, documents });
  }

  if (req.method === 'POST') {
    const { orgId, ownerEmail, filename, mimeType, size, contentBase64, createdByEmail } = req.body || {};
    if (!orgId || !contentBase64 || !filename) {
      return res.status(400).json({ ok: false, error: 'orgId, filename, and content are required' });
    }
    ensureOrgConfig(store, orgId, ownerEmail);
    const buffer = Buffer.from(contentBase64, 'base64');
    const docHash = sha256Hex(buffer);
    const record = {
      id: crypto.randomUUID ? crypto.randomUUID() : `doc_${crypto.randomBytes(8).toString('hex')}`,
      orgId,
      filename,
      mimeType: mimeType || 'application/octet-stream',
      size: size || buffer.length,
      docHash,
      contentBase64,
      createdByEmail: createdByEmail || 'unknown',
      sandbox: { status: 'queued' },
      quarantined: false,
      created_date: new Date().toISOString(),
    };
    store.documents = [record, ...(store.documents || [])];
    saveServerStore(store);
    return res.status(201).json({ ok: true, document: record });
  }

  if (req.method === 'PUT') {
    const { id, orgId, updates } = req.body || {};
    if (!id || !orgId || !updates) {
      return res.status(400).json({ ok: false, error: 'id, orgId, and updates are required' });
    }
    const documents = store.documents || [];
    const index = documents.findIndex((doc) => doc.id === id && doc.orgId === orgId);
    if (index < 0) {
      return res.status(404).json({ ok: false, error: 'Document not found' });
    }
    documents[index] = { ...documents[index], ...updates };
    store.documents = documents;
    saveServerStore(store);
    return res.status(200).json({ ok: true, document: documents[index] });
  }

  res.setHeader('Allow', 'GET, POST, PUT');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}

