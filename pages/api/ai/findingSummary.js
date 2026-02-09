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
        temperature: 0.2,
        maxOutputTokens: 500,
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

const fallbackSummary = (finding) => ({
  summary: finding?.description || 'Security finding requires review and remediation.',
  owaspCategory: finding?.owasp_category || 'Unknown',
  references: ['OWASP Top 10', 'CWE', 'Vendor advisory'],
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { finding } = req.body || {};
  if (!finding) {
    return res.status(400).json({ ok: false, error: 'finding is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  if (!apiKey) {
    return res.status(200).json({ ok: true, summary: fallbackSummary(finding), fallback: true });
  }

  const prompt = `You are a senior application security analyst. Provide a short, plain-language summary for this finding and map it to the most relevant OWASP Top 10 (2021) category.

Return ONLY valid JSON with these keys:
summary, owaspCategory, references

Finding details:
Title: ${finding.title}
Severity: ${finding.severity}
Category: ${finding.category}
Description: ${finding.description}
File: ${finding.filePath || 'unknown'}
Rule: ${finding.ruleId || 'n/a'}

Guidelines:
- Keep summary under 80 words.
- Avoid speculation and exploit instructions.
- References should be short strings like "OWASP A03:2021 Injection" or "CWE-89".
`;

  try {
    const text = await callGemini({ apiKey, model, prompt });
    const parsed = extractJson(text);
    if (!parsed) {
      return res.status(200).json({ ok: true, summary: fallbackSummary(finding), fallback: true });
    }
    return res.status(200).json({ ok: true, summary: parsed });
  } catch (error) {
    return res.status(200).json({ ok: true, summary: fallbackSummary(finding), fallback: true });
  }
}
