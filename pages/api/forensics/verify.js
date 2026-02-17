import { ensureOrgConfig, loadServerStore, saveServerStore } from '@/lib/serverStore';
import {
  decodeWatermarkPayload,
  extractForensicWatermark,
  sha256Hex,
  verifyWatermarkPayload,
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

  const { orgId, ownerEmail, contentBase64 } = req.body || {};
  if (!orgId || !contentBase64) {
    return res.status(400).json({ ok: false, error: 'orgId and file content are required' });
  }

  const store = loadServerStore();
  const orgConfig = ensureOrgConfig(store, orgId, ownerEmail);
  if (!orgConfig.forensicWatermarkSecret) {
    return res.status(400).json({ ok: false, error: 'Forensic watermark secret not configured.' });
  }

  const buffer = Buffer.from(contentBase64, 'base64');
  const observedFileHash = sha256Hex(buffer);
  const extracted = extractForensicWatermark(buffer);
  if (!extracted?.payloadB64Url) {
    const event = store.watermarkEvents.find(
      (item) => item.orgId === orgId && item.watermarkedHash === observedFileHash
    );
    if (!event) {
      const docMatch = (store.documents || []).find(
        (doc) => doc.orgId === orgId && doc.docHash === observedFileHash
      );
      if (docMatch) {
        return res.status(200).json({
          ok: true,
          result: {
            matchMethod: 'original',
            watermarkId: null,
            documentHash: docMatch.docHash,
            issuedAt: docMatch.createdAt || docMatch.created_date || null,
            signatureValid: false,
            forensicId: null,
            userEmail: null,
            downloadedAt: null,
            userHash: null,
            observedFileHash,
            strippedFileHash: null,
            documentId: docMatch.id,
            wrapped: 'no',
            note: 'Original file detected. No per-user forensic watermark found.',
          },
        });
      }
      return res.status(404).json({ ok: false, error: 'No forensic watermark found.' });
    }

    const result = {
      matchMethod: 'hash',
      watermarkId: event.watermarkId,
      documentHash: event.documentHash,
      issuedAt: event.downloadedAt,
      signatureValid: false,
      forensicId: event.forensicId,
      userEmail: event.userEmail,
      downloadedAt: event.downloadedAt,
      userHash: event.userHash,
      observedFileHash,
      strippedFileHash: null,
      documentId: event.documentId || '—',
      wrapped: event.wrapped ? 'yes' : 'no',
    };

    saveServerStore(store);
    return res.status(200).json({ ok: true, result });
  }

  const payload = decodeWatermarkPayload(extracted.payloadB64Url);
  const signatureValid = verifyWatermarkPayload({
    secret: orgConfig.forensicWatermarkSecret,
    payload,
  });

  const event = store.watermarkEvents.find(
    (item) => item.watermarkId === payload.id && item.orgId === orgId
  );

  const strippedFileHash = extracted.originalBuffer ? sha256Hex(extracted.originalBuffer) : null;

  const result = {
    matchMethod: 'embedded',
    watermarkId: payload.id,
    documentHash: payload.dh,
    issuedAt: payload.iat,
    signatureValid,
    forensicId: event?.forensicId || '—',
    userEmail: event?.userEmail || 'Unknown',
    downloadedAt: event?.downloadedAt || payload.iat,
    userHash: event?.userHash || '—',
    observedFileHash,
    strippedFileHash,
    documentId: event?.documentId || '—',
    wrapped: event?.wrapped ? 'yes' : 'no',
  };

  saveServerStore(store);
  return res.status(200).json({ ok: true, result });
}
