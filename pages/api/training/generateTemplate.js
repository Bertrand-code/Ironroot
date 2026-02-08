export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const callGemini = async ({ apiKey, model, prompt }) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 700,
      },
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message || 'AI request failed.');
  }
  const candidate = data?.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  return part?.text || '';
};

const extractJson = (text) => {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch (error) {
    return null;
  }
};

const fallbackTemplate = (context = {}) => ({
  name: context.name || 'Security Awareness Simulation',
  subject: 'Action required: security verification',
  fromName: 'Security Awareness',
  fromEmail: 'security@ironroot.ai',
  landingPage: 'Security Verification Portal',
  category: context.category || 'Awareness',
  vector: context.vector || 'Email',
  difficulty: context.difficulty || 'Medium',
  htmlBody: `<h2>Security Verification Required</h2>
<p>This is a security awareness simulation for training purposes.</p>
<p>Please review the security notice and confirm you understand the guidance.</p>
<a href="#" style="display:inline-block;padding:12px 18px;background:#ef4444;color:#fff;text-decoration:none;border-radius:8px;">Review Notice</a>
<p style="margin-top:16px;color:#9ca3af;">If this message seems suspicious, report it to the security team.</p>`,
});

const buildPrompt = ({ scenario, brand, tone, difficulty, vector }) => {
  return `You are an expert security awareness designer. Generate a training email template for a phishing simulation.

Return ONLY valid JSON with these keys:
name, subject, fromName, fromEmail, landingPage, category, vector, difficulty, htmlBody

Guidelines:
- Use professional, realistic language.
- Make it clearly a simulation in subtle footer text.
- Include a CTA button.
- Keep htmlBody concise with inline styles.
- Do not include any malicious links or instructions.
- Use the following context:
Scenario: ${scenario || 'credential verification'}
Brand style: ${brand || 'enterprise SaaS'}
Tone: ${tone || 'urgent but professional'}
Difficulty: ${difficulty || 'Medium'}
Vector: ${vector || 'Email'}

Return JSON only.`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { scenario, brand, tone, difficulty, vector } = req.body || {};
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return res.status(200).json({ ok: true, template: fallbackTemplate({ difficulty, vector }), fallback: true });
  }

  try {
    const text = await callGemini({ apiKey, model, prompt: buildPrompt({ scenario, brand, tone, difficulty, vector }) });
    const parsed = extractJson(text);
    if (!parsed) {
      return res.status(200).json({ ok: true, template: fallbackTemplate({ difficulty, vector }), fallback: true });
    }
    return res.status(200).json({ ok: true, template: parsed });
  } catch (error) {
    return res.status(200).json({ ok: true, template: fallbackTemplate({ difficulty, vector }), fallback: true });
  }
}
