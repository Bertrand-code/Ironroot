import { ensureOrgConfig, generateSecret, loadServerStore, saveServerStore } from '@/lib/serverStore';

export default function handler(req, res) {
  if (req.method === 'GET') {
    const { orgId, ownerEmail } = req.query;
    if (!orgId) {
      return res.status(400).json({ ok: false, error: 'orgId is required' });
    }
    const store = loadServerStore();
    const orgConfig = ensureOrgConfig(store, orgId, ownerEmail);
    saveServerStore(store);
    return res.status(200).json({
      ok: true,
      config: {
        orgId,
        ownerEmail: orgConfig.ownerEmail,
        forensicWatermarkingEnabled: !!orgConfig.forensicWatermarkingEnabled,
        secretConfigured: !!orgConfig.forensicWatermarkSecret,
        allowAdminVerify: !!orgConfig.allowAdminVerify,
      },
    });
  }

  if (req.method === 'POST') {
    const { orgId, ownerEmail, enable, allowAdminVerify } = req.body || {};
    if (!orgId) {
      return res.status(400).json({ ok: false, error: 'orgId is required' });
    }
    const store = loadServerStore();
    const orgConfig = ensureOrgConfig(store, orgId, ownerEmail);
    if (typeof enable === 'boolean') {
      orgConfig.forensicWatermarkingEnabled = enable;
    }
    if (typeof allowAdminVerify === 'boolean') {
      orgConfig.allowAdminVerify = allowAdminVerify;
    }
    if (orgConfig.forensicWatermarkingEnabled && !orgConfig.forensicWatermarkSecret) {
      orgConfig.forensicWatermarkSecret = generateSecret();
    }
    orgConfig.updatedAt = new Date().toISOString();
    store.orgs[orgId] = orgConfig;
    saveServerStore(store);
    return res.status(200).json({
      ok: true,
      config: {
        orgId,
        ownerEmail: orgConfig.ownerEmail,
        forensicWatermarkingEnabled: !!orgConfig.forensicWatermarkingEnabled,
        secretConfigured: !!orgConfig.forensicWatermarkSecret,
        allowAdminVerify: !!orgConfig.allowAdminVerify,
      },
    });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ ok: false, error: 'Method not allowed' });
}
