export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const extractUserQuestion = (prompt) => {
  if (!prompt) return '';
  const lines = String(prompt).split('\n').map((line) => line.trim()).filter(Boolean);
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    if (line.toLowerCase().startsWith('user question:')) {
      return line.replace(/user question:/i, '').trim();
    }
    if (line.toLowerCase().startsWith('user:')) {
      return line.replace(/user:/i, '').trim();
    }
  }
  return String(prompt).slice(-400).trim();
};

const fallbackAnswer = (prompt) => {
  const question = extractUserQuestion(prompt);
  const text = question.toLowerCase();
  if (text.includes('log4j') || text.includes('log4shell')) {
    return 'Log4Shell (CVE-2021-44228) is a critical RCE in Apache Log4j. Immediate actions: identify affected versions (2.0–2.14.1), upgrade to a fixed release, disable message lookups, and rotate exposed secrets. Monitor for exploit attempts and validate no malicious JNDI lookups or unexpected outbound LDAP traffic.';
  }
  if (text.includes('what can you do') || text.includes('capabilities') || text.includes('platform')) {
    return 'I can explain Ironroot features, prioritize security findings, recommend remediation steps, and guide you through threat intel, scanning, and compliance workflows. Ask about a specific module (Code Scanner, Threat Intel, AI Pentest, Document Vault) and I’ll go deeper.';
  }
  if (text.includes('sql injection')) {
    return 'SQL injection allows attackers to manipulate database queries. Use parameterized queries, validate input, apply least privilege, and add WAF rules to block known injection patterns.';
  }
  if (text.includes('xss')) {
    return 'XSS happens when untrusted input is rendered as HTML/JS. Use output encoding, sanitize input, and enforce a strict Content Security Policy.';
  }
  if (text.includes('threat') || text.includes('intel')) {
    return 'Threat intel ties CVEs, active exploitation, and IOC signals to your assets. The fastest wins are patching exposed services, rotating credentials, and monitoring high-risk IOCs.';
  }
  return 'Tell me what you want to secure (app, API, cloud, or endpoints) and I’ll break down the risks, likely attack paths, and the highest-impact fixes.';
};

const callGemini = async ({ apiKey, model, prompt }) => {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ ok: false, error: 'prompt is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return res.status(200).json({ ok: true, text: fallbackAnswer(prompt), fallback: true });
  }

  try {
    const text = await callGemini({ apiKey, model, prompt });
    if (!text) {
      return res.status(200).json({ ok: true, text: fallbackAnswer(prompt), fallback: true });
    }
    return res.status(200).json({ ok: true, text });
  } catch (error) {
    return res.status(200).json({ ok: true, text: fallbackAnswer(prompt), fallback: true });
  }
}
