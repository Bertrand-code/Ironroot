export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const token = process.env.SEMGREP_APP_TOKEN;
  const deploymentId = process.env.SEMGREP_DEPLOYMENT_ID;

  if (!token) {
    return res.status(200).json({ ok: false, connected: false, error: 'SEMGREP_APP_TOKEN not configured' });
  }
  if (!deploymentId) {
    return res.status(200).json({ ok: false, connected: false, error: 'SEMGREP_DEPLOYMENT_ID not configured' });
  }

  const start = Date.now();
  const url = `https://semgrep.dev/api/v1/deployments/${deploymentId}/findings?per_page=1`;
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const latencyMs = Date.now() - start;
    const ok = response.ok;
    return res.status(200).json({
      ok,
      connected: ok,
      deploymentId,
      latencyMs,
      checkedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(200).json({
      ok: false,
      connected: false,
      deploymentId,
      error: error.message,
      checkedAt: new Date().toISOString(),
    });
  }
}
