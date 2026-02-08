import crypto from 'crypto';
import { ensureOrgConfig, generateSecret, loadServerStore, saveServerStore } from '@/lib/serverStore';
import {
  embedForensicWatermark,
  encodeWatermarkPayload,
  makeWatermarkPayload,
  sha256Hex,
} from '@/lib/serverForensics';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '12mb',
    },
  },
};

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { orgId, ownerEmail, featureEnabled, document, user } = req.body || {};
  if (!orgId || (!document?.contentBase64 && !document?.id)) {
    return res.status(400).json({ ok: false, error: 'orgId and document content or id are required' });
  }

  const store = loadServerStore();
  const orgConfig = ensureOrgConfig(store, orgId, ownerEmail);

  if (!orgConfig.forensicWatermarkingEnabled && !featureEnabled) {
    return res.status(403).json({ ok: false, error: 'Forensic watermarking is not enabled.' });
  }

  if (!orgConfig.forensicWatermarkingEnabled && featureEnabled) {
    orgConfig.forensicWatermarkingEnabled = true;
  }

  if (!orgConfig.forensicWatermarkSecret) {
    orgConfig.forensicWatermarkSecret = generateSecret();
  }

  let sourceBase64 = document.contentBase64;
  if (!sourceBase64 && document.id) {
    const stored = (store.documents || []).find((item) => item.id === document.id && item.orgId === orgId);
    if (!stored?.contentBase64) {
      return res.status(404).json({ ok: false, error: 'Document content not found on server.' });
    }
    sourceBase64 = stored.contentBase64;
  }

  const buffer = Buffer.from(sourceBase64, 'base64');
  const docHash = sha256Hex(buffer);
  const watermarkId = crypto.randomUUID ? crypto.randomUUID() : `wm_${crypto.randomBytes(8).toString('hex')}`;
  const issuedAt = new Date().toISOString();
  const payload = makeWatermarkPayload({
    secret: orgConfig.forensicWatermarkSecret,
    watermarkId,
    documentHash: docHash,
    issuedAt,
  });
  const payloadB64Url = encodeWatermarkPayload(payload);
  const embedded = embedForensicWatermark({
    buffer,
    filename: document.filename || 'document',
    mimeType: document.mimeType || 'application/octet-stream',
    payloadB64Url,
  });

  const userEmail = user?.email || 'unknown';
  const userHash = sha256Hex(Buffer.from(`${user?.fullName || ''}|${userEmail}|${issuedAt}`));
  const forensicId = `IR-${watermarkId.replace(/-/g, '').slice(0, 10).toUpperCase()}`;

  const event = {
    id: crypto.randomUUID ? crypto.randomUUID() : `evt_${crypto.randomBytes(8).toString('hex')}`,
    watermarkId,
    forensicId,
    documentId: document.id || null,
    documentHash: docHash,
    downloadedAt: issuedAt,
    userId: user?.id || null,
    userEmail,
    userHash,
    wrapped: embedded.wrapped,
    outputFilename: embedded.filename,
    orgId,
  };

  store.watermarkEvents.unshift(event);
  store.orgs[orgId] = orgConfig;
  saveServerStore(store);

  return res.status(200).json({
    ok: true,
    watermarked: {
      contentBase64: embedded.buffer.toString('base64'),
      filename: embedded.filename,
      mimeType: embedded.mimeType,
      wrapped: embedded.wrapped,
    },
    event,
  });
}
