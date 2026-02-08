const WATERMARK_MARKER = 'IRONROOT-WM1:';
const WRAPPER_FORMAT = 'ironroot-watermarked-v1';

const hasWebCrypto = () => typeof crypto !== 'undefined' && !!crypto.subtle;

const bufferToHex = (buffer) =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const encodeUtf8 = (text) => new TextEncoder().encode(text);

const decodeUtf8 = (bytes) => {
  try {
    return new TextDecoder('utf-8', { fatal: false }).decode(bytes);
  } catch {
    return '';
  }
};

const concatBytes = (a, b) => {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
};

export const bytesToBase64 = (bytes) => {
  if (typeof btoa === 'undefined') {
    throw new Error('Base64 encoding is only supported in the browser for now.');
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
};

export const base64ToBytes = (base64) => {
  if (typeof atob === 'undefined') {
    throw new Error('Base64 decoding is only supported in the browser for now.');
  }
  const binary = atob(base64);
  const out = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    out[i] = binary.charCodeAt(i);
  }
  return out;
};

const base64UrlEncode = (text) =>
  btoa(text).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');

const base64UrlDecode = (text) => {
  const padded = text.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(text.length / 4) * 4, '=');
  return atob(padded);
};

const timingSafeEqualHex = (a, b) => {
  if (!a || !b || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i += 1) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
};

export const sha256Hex = async (bytes) => {
  if (!hasWebCrypto()) {
    throw new Error('Secure hashing is unavailable in this environment.');
  }
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return bufferToHex(digest);
};

export const hmacSha256Hex = async (secret, message) => {
  if (!hasWebCrypto()) {
    throw new Error('Secure signing is unavailable in this environment.');
  }
  const key = await crypto.subtle.importKey(
    'raw',
    encodeUtf8(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encodeUtf8(message));
  return bufferToHex(signature);
};

export const makeWatermarkPayload = async ({ secret, watermarkId, documentHash, issuedAt }) => {
  const issued = issuedAt || new Date().toISOString();
  const message = `${watermarkId}:${documentHash}:${issued}`;
  const signature = await hmacSha256Hex(secret, message);
  return {
    v: 1,
    id: watermarkId,
    dh: documentHash,
    iat: issued,
    sig: signature,
  };
};

export const encodeWatermarkPayload = (payload) => {
  if (typeof btoa === 'undefined') {
    throw new Error('Encoding is only supported in the browser for now.');
  }
  return base64UrlEncode(JSON.stringify(payload));
};

export const decodeWatermarkPayload = (payloadB64Url) => {
  if (typeof atob === 'undefined') {
    throw new Error('Decoding is only supported in the browser for now.');
  }
  return JSON.parse(base64UrlDecode(payloadB64Url));
};

export const verifyWatermarkPayload = async ({ secret, payload }) => {
  if (!payload || payload.v !== 1 || !payload.id || !payload.dh || !payload.iat || !payload.sig) {
    return false;
  }
  const message = `${payload.id}:${payload.dh}:${payload.iat}`;
  const computed = await hmacSha256Hex(secret, message);
  return timingSafeEqualHex(computed, payload.sig);
};

export const embedForensicWatermark = ({ bytes, filename, mimeType, payloadB64Url }) => {
  const marker = `${WATERMARK_MARKER}${payloadB64Url}`;
  const name = filename || 'document';
  const lowerName = name.toLowerCase();
  const lowerMime = (mimeType || '').toLowerCase();
  const isPdf = lowerMime.includes('pdf') || lowerName.endsWith('.pdf');
  const isText =
    lowerMime.startsWith('text/') ||
    ['.txt', '.md', '.json', '.csv', '.log', '.html', '.js', '.ts', '.jsx', '.tsx'].some((ext) => lowerName.endsWith(ext));

  if (isPdf) {
    // PDF readers typically tolerate trailing bytes after %%EOF; we append a comment marker.
    const suffix = encodeUtf8(`\n%${marker}\n`);
    return { bytes: concatBytes(bytes, suffix), filename: name, mimeType: mimeType || 'application/pdf', wrapped: false };
  }

  if (isText) {
    const suffix = encodeUtf8(`\n${marker}\n`);
    return { bytes: concatBytes(bytes, suffix), filename: name, mimeType: mimeType || 'text/plain', wrapped: false };
  }

  // Fallback wrapper for binary formats where appending bytes could corrupt the file.
  const wrapper = {
    format: WRAPPER_FORMAT,
    original: {
      filename: name,
      mimeType: mimeType || 'application/octet-stream',
      contentBase64: bytesToBase64(bytes),
    },
    watermark: marker,
  };
  const wrapperBytes = encodeUtf8(JSON.stringify(wrapper, null, 2));
  return {
    bytes: wrapperBytes,
    filename: `${name}.ironrootwm.json`,
    mimeType: 'application/json',
    wrapped: true,
  };
};

const findLastAscii = (bytes, asciiNeedle) => {
  const needle = encodeUtf8(asciiNeedle);
  outer: for (let i = bytes.length - needle.length; i >= 0; i -= 1) {
    for (let j = 0; j < needle.length; j += 1) {
      if (bytes[i + j] !== needle[j]) continue outer;
    }
    return i;
  }
  return -1;
};

export const extractForensicWatermark = (bytes) => {
  if (!(bytes instanceof Uint8Array)) return null;

  // Wrapper first (cleanest parse)
  const text = decodeUtf8(bytes);
  if (text.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed?.format === WRAPPER_FORMAT && typeof parsed?.watermark === 'string') {
        const idx = parsed.watermark.lastIndexOf(WATERMARK_MARKER);
        if (idx >= 0) {
          const payloadB64Url = parsed.watermark.slice(idx + WATERMARK_MARKER.length).trim();
          const originalBytes = parsed?.original?.contentBase64
            ? base64ToBytes(parsed.original.contentBase64)
            : null;
          return {
            payloadB64Url,
            wrapper: true,
            original: parsed?.original || null,
            originalBytes,
          };
        }
      }
    } catch {
      // Ignore JSON parse failures, fall through to raw scan.
    }
  }

  // Raw scan for appended marker
  const markerIndex = findLastAscii(bytes, WATERMARK_MARKER);
  if (markerIndex < 0) return null;

  const after = bytes.subarray(markerIndex + WATERMARK_MARKER.length);
  const afterText = decodeUtf8(after);
  const payloadB64Url = afterText.split(/[\r\n\s]/)[0]?.trim();
  if (!payloadB64Url) return null;

  // Attempt to strip watermark bytes to recover the original hash.
  let stripEnd = markerIndex;
  // Remove common prefixes we add before the marker: "\n%", "\n", or "\r\n%".
  for (let i = 0; i < 3; i += 1) {
    const prev = stripEnd - 1;
    if (prev < 0) break;
    const b = bytes[prev];
    if (b === 0x0a || b === 0x0d || b === 0x25) {
      stripEnd -= 1;
    } else {
      break;
    }
  }
  const stripped = bytes.subarray(0, Math.max(0, stripEnd));
  return { payloadB64Url, wrapper: false, originalBytes: stripped };
};
