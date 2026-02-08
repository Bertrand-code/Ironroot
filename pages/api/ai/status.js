export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  return res.status(200).json({
    ok: true,
    geminiConfigured: !!process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  });
}
