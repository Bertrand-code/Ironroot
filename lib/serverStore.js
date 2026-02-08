import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const STORE_DIR = path.join(process.cwd(), '.data');
const STORE_PATH = path.join(STORE_DIR, 'ironroot-server-store.json');
const STORE_VERSION = 1;

const defaultStore = {
  meta: { version: STORE_VERSION },
  orgs: {},
  documents: [],
  watermarkEvents: [],
  watermarkRequests: [],
  auditEvents: [],
  auditHeads: {},
};

const ensureDir = () => {
  if (!fs.existsSync(STORE_DIR)) {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  }
};

export const loadServerStore = () => {
  ensureDir();
  if (!fs.existsSync(STORE_PATH)) {
    fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore, null, 2));
    return JSON.parse(JSON.stringify(defaultStore));
  }
  try {
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed?.meta?.version || parsed.meta.version !== STORE_VERSION) {
      fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore, null, 2));
      return JSON.parse(JSON.stringify(defaultStore));
    }
    return {
      ...defaultStore,
      ...parsed,
      auditEvents: parsed.auditEvents || [],
      auditHeads: parsed.auditHeads || {},
    };
  } catch {
    fs.writeFileSync(STORE_PATH, JSON.stringify(defaultStore, null, 2));
    return JSON.parse(JSON.stringify(defaultStore));
  }
};

export const saveServerStore = (store) => {
  ensureDir();
  fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2));
};

export const ensureOrgConfig = (store, orgId, ownerEmail) => {
  if (!orgId) throw new Error('orgId is required');
  const existing = store.orgs[orgId] || {};
  const next = {
    orgId,
    ownerEmail: ownerEmail || existing.ownerEmail || null,
    forensicWatermarkingEnabled: existing.forensicWatermarkingEnabled || false,
    forensicWatermarkSecret: existing.forensicWatermarkSecret || null,
    allowAdminVerify: typeof existing.allowAdminVerify === 'boolean' ? existing.allowAdminVerify : false,
    updatedAt: new Date().toISOString(),
  };
  store.orgs[orgId] = next;
  return next;
};

export const generateSecret = () => {
  if (crypto.randomUUID) return crypto.randomUUID();
  return crypto.randomBytes(16).toString('hex');
};
