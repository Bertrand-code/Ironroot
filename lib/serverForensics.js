import crypto from 'crypto';

const WATERMARK_MARKER = 'IRONROOT-WM1:';
const WRAPPER_FORMAT = 'ironroot-watermarked-v1';

const base64UrlEncode = (input) =>
  Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');

const base64UrlDecode = (input) => {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(input.length / 4) * 4, '=');
  return Buffer.from(padded, 'base64').toString('utf8');
};

const timingSafeEqualHex = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
};

export const sha256Hex = (buffer) =>
  crypto.createHash('sha256').update(buffer).digest('hex');

export const hmacSha256Hex = (secret, message) =>
  crypto.createHmac('sha256', secret).update(message).digest('hex');

export const makeWatermarkPayload = ({ secret, watermarkId, documentHash, issuedAt }) => {
  const issued = issuedAt || new Date().toISOString();
  const message = `${watermarkId}:${documentHash}:${issued}`;
  const signature = hmacSha256Hex(secret, message);
  return {
    v: 1,
    id: watermarkId,
    dh: documentHash,
    iat: issued,
    sig: signature,
  };
};

export const encodeWatermarkPayload = (payload) => base64UrlEncode(JSON.stringify(payload));

export const decodeWatermarkPayload = (payloadB64Url) =>
  JSON.parse(base64UrlDecode(payloadB64Url));

export const verifyWatermarkPayload = ({ secret, payload }) => {
  if (!payload || payload.v !== 1 || !payload.id || !payload.dh || !payload.iat || !payload.sig) {
    return false;
  }
  const message = `${payload.id}:${payload.dh}:${payload.iat}`;
  const computed = hmacSha256Hex(secret, message);
  return timingSafeEqualHex(computed, payload.sig);
};

export const embedForensicWatermark = ({ buffer, filename, mimeType, payloadB64Url }) => {
  const marker = `${WATERMARK_MARKER}${payloadB64Url}`;
  const lowerName = (filename || '').toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();
  const isPdf = lowerMime.includes('pdf') || lowerName.endsWith('.pdf');
  const isText =
    lowerMime.startsWith('text/') ||
    ['.txt', '.md', '.json', '.csv', '.log', '.html', '.js', '.ts', '.jsx', '.tsx'].some((ext) =>
      lowerName.endsWith(ext)
    );

  if (isPdf) {
    const suffix = Buffer.from(`\n%${marker}\n`, 'utf8');
    return { buffer: Buffer.concat([buffer, suffix]), filename, mimeType: mimeType || 'application/pdf', wrapped: false };
  }

  if (isText) {
    const suffix = Buffer.from(`\n${marker}\n`, 'utf8');
    return { buffer: Buffer.concat([buffer, suffix]), filename, mimeType: mimeType || 'text/plain', wrapped: false };
  }

  const wrapper = {
    format: WRAPPER_FORMAT,
    original: {
      filename,
      mimeType: mimeType || 'application/octet-stream',
      contentBase64: buffer.toString('base64'),
    },
    watermark: marker,
  };
  const wrapperBuffer = Buffer.from(JSON.stringify(wrapper, null, 2), 'utf8');
  return {
    buffer: wrapperBuffer,
    filename: `${filename}.ironrootwm.json`,
    mimeType: 'application/json',
    wrapped: true,
  };
};

export const extractForensicWatermark = (buffer) => {
  if (!Buffer.isBuffer(buffer)) return null;

  const trimmed = buffer.toString('utf8', 0, Math.min(buffer.length, 2048));
  if (trimmed.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(buffer.toString('utf8'));
      if (parsed?.format === WRAPPER_FORMAT && typeof parsed?.watermark === 'string') {
        const idx = parsed.watermark.lastIndexOf(WATERMARK_MARKER);
        if (idx >= 0) {
          const payloadB64Url = parsed.watermark.slice(idx + WATERMARK_MARKER.length).trim();
          const originalBuffer = parsed?.original?.contentBase64
            ? Buffer.from(parsed.original.contentBase64, 'base64')
            : null;
          return { payloadB64Url, wrapper: true, originalBuffer };
        }
      }
    } catch {
      // fall through
    }
  }

  const markerIndex = buffer.lastIndexOf(Buffer.from(WATERMARK_MARKER, 'utf8'));
  if (markerIndex < 0) return null;

  const after = buffer.slice(markerIndex + Buffer.byteLength(WATERMARK_MARKER));
  const afterText = after.toString('utf8');
  const payloadB64Url = afterText.split(/[\r\n\s]/)[0]?.trim();
  if (!payloadB64Url) return null;

  let stripEnd = markerIndex;
  for (let i = 0; i < 3; i += 1) {
    const prev = stripEnd - 1;
    if (prev < 0) break;
    const b = buffer[prev];
    if (b === 0x0a || b === 0x0d || b === 0x25) {
      stripEnd -= 1;
    } else {
      break;
    }
  }
  const originalBuffer = buffer.slice(0, Math.max(0, stripEnd));

  return { payloadB64Url, wrapper: false, originalBuffer };
};

