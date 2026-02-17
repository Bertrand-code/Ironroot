import { INTEGRATIONS } from '@/lib/integrationsRegistry';

const RATE_LIMIT = { windowMs: 60000, limit: 20 };
const buckets = new Map();
const DEMO_DATA = {
  nvd: {
    vulnerabilities: [
      {
        cve: {
          id: 'CVE-2025-1183',
          published: '2025-02-02T12:00:00.000Z',
          lastModified: '2025-02-03T12:00:00.000Z',
          descriptions: [
            {
              lang: 'en',
              value: 'Demo snapshot for dependency poisoning in build pipelines.',
            },
          ],
          metrics: {
            cvssMetricV31: [
              {
                cvssData: { baseScore: 8.2, baseSeverity: 'HIGH', vectorString: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
                exploitabilityScore: 2.8,
                impactScore: 5.4,
              },
            ],
          },
        },
      },
    ],
  },
  shodan: {
    matches: [
      { ip_str: '203.0.113.10', port: 443, org: 'Demo Corp', product: 'nginx', tags: ['https'] },
      { ip_str: '203.0.113.44', port: 22, org: 'Demo Corp', product: 'OpenSSH', tags: ['ssh'] },
    ],
  },
  censys: {
    result: {
      total: 2,
      hits: [
        { ip: '198.51.100.21', services: [{ port: 443, service_name: 'https' }] },
        { ip: '198.51.100.34', services: [{ port: 3389, service_name: 'rdp' }] },
      ],
    },
  },
  securitytrails: { records: [{ hostname: 'app.demo.com', type: 'A', value: '203.0.113.10' }] },
  binaryedge: { events: [{ target: '203.0.113.10', type: 'open_port', port: 443 }] },
  virustotal: { data: [{ id: 'demo-hash', type: 'file', attributes: { last_analysis_stats: { malicious: 1 } } }] },
  otx: { pulse_info: { count: 1, pulses: [{ name: 'Demo Threat Pulse', adversary: 'Demo Group' }] } },
  abuseipdb: { data: { ipAddress: '203.0.113.10', abuseConfidenceScore: 25, totalReports: 3 } },
  exploitdb: { data: [{ id: 99999, description: 'Demo exploit entry', date: '2025-01-15' }] },
  github: { items: [{ full_name: 'demo/ironroot-app', stargazers_count: 152 }], total_count: 1 },
  semgrep: { findings: [{ severity: 'HIGH', message: 'Demo SQL injection finding' }] },
  snyk: { issues: [{ id: 'demo-issue', severity: 'high', title: 'Demo vulnerable package' }] },
};

const allowRequest = (key) => {
  const now = Date.now();
  const bucket = buckets.get(key) || { count: 0, start: now };
  if (now - bucket.start > RATE_LIMIT.windowMs) {
    buckets.set(key, { count: 1, start: now });
    return true;
  }
  if (bucket.count >= RATE_LIMIT.limit) return false;
  bucket.count += 1;
  buckets.set(key, bucket);
  return true;
};

const resolveIntegration = (id) => INTEGRATIONS.find((item) => item.id === id);

const resolveEnvKey = (auth) => {
  if (!auth?.env) return null;
  return process.env[auth.env] || (auth.envFallback ? process.env[auth.envFallback] : null);
};

const buildHeaders = (auth) => {
  if (!auth) return {};
  if (auth.type === 'header') {
    const key = resolveEnvKey(auth);
    if (!key) return null;
    const value = auth.format ? auth.format.replace('${key}', key) : key;
    return { [auth.header]: value };
  }
  if (auth.type === 'basic') {
    const id = process.env[auth.envId];
    const secret = process.env[auth.envSecret];
    if (!id || !secret) return null;
    const encoded = Buffer.from(`${id}:${secret}`).toString('base64');
    return { Authorization: `Basic ${encoded}` };
  }
  return {};
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const demoMode = process.env.IRONROOT_DEMO_INTEGRATIONS === 'true';
  const { provider, path = '', ...rest } = req.query;
  const integration = resolveIntegration(provider);
  if (!integration) {
    return res.status(400).json({ error: 'Unknown provider' });
  }

  const headers = buildHeaders(integration.auth);
  if (headers === null) {
    if (demoMode) {
      return res.status(200).json({ ok: true, demo: true, data: DEMO_DATA[provider] || { notice: 'Demo mode enabled.' } });
    }
    return res.status(400).json({ error: 'Integration not configured' });
  }

  const rateKey = `${req.headers['x-forwarded-for'] || req.socket.remoteAddress}:${provider}`;
  if (!allowRequest(rateKey)) {
    return res.status(429).json({ error: 'Rate limit exceeded' });
  }

  const safePath = Array.isArray(path) ? path.join('/') : path;
  const url = new URL(integration.baseUrl.replace(/\/$/, '') + '/' + safePath.replace(/^\//, ''));

  if (integration.auth?.type === 'query' && integration.auth.param) {
    const key = resolveEnvKey(integration.auth);
    if (key) url.searchParams.set(integration.auth.param, key);
  }

  Object.entries(rest).forEach(([key, value]) => {
    if (value == null) return;
    if (key === 'provider' || key === 'path') return;
    if (Array.isArray(value)) {
      value.forEach((item) => url.searchParams.append(key, item));
    } else {
      url.searchParams.set(key, value);
    }
  });

  try {
    const response = await fetch(url.toString(), { headers });
    const contentType = response.headers.get('content-type') || '';
    const body = contentType.includes('application/json')
      ? await response.json()
      : await response.text();
    return res.status(response.status).json({ ok: response.ok, data: body });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reach provider', details: error.message });
  }
}
