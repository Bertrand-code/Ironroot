export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { deploymentId } = req.query;
  if (!deploymentId) {
    return res.status(400).json({ ok: false, error: 'deploymentId is required' });
  }

  const token = process.env.SEMGREP_APP_TOKEN;
  if (!token) {
    return res.status(400).json({ ok: false, error: 'Semgrep token not configured' });
  }

  const url = `https://semgrep.dev/api/v1/deployments/${deploymentId}/findings`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = await response.json().catch(() => ({}));
    return res.status(response.status).json({ ok: response.ok, data });
  } catch (error) {
    return res.status(500).json({ ok: false, error: 'Failed to reach Semgrep', details: error.message });
  }
}
