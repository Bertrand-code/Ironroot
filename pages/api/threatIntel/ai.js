export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

const buildPrompt = (query) => {
  return `You are Ironroot Threat Intelligence. Provide a concise, analyst-grade response in JSON.
Return JSON with keys: summary, impact, knownExploitation, iocs, mitigations, references, lastUpdated, confidence, notes.
Guidelines:
- summary: 2-4 sentences, factual and non-speculative.
- impact: one sentence on business impact.
- knownExploitation: "active", "probable", or "unknown" with a short reason.
- iocs: array of up to 6 strings (only include if well-known and reliable).
- mitigations: array of up to 6 actionable items.
- references: array of reputable sources (vendor advisories, NVD, CISA, OWASP). Do not fabricate sources.
- lastUpdated: ISO date string if known, otherwise "unknown".
- confidence: "high", "medium", or "low" based on reliability.
- notes: if uncertain, say what is unknown or requires verification.
If you are unsure, say "unknown" and provide fewer details rather than guessing.
Topic: ${query}`;
};

const fallbackIntel = (query) => {
  const q = String(query || '').toLowerCase();
  if (q.includes('log4j') || q.includes('log4shell')) {
    return {
      summary:
        'Log4Shell is a critical remote code execution flaw in Apache Log4j (CVE-2021-44228) affecting multiple versions. It enables attackers to execute arbitrary code via malicious JNDI lookups and has been widely exploited.',
      impact:
        'High risk of full server compromise, data theft, and lateral movement if vulnerable versions are exposed.',
      knownExploitation: 'active - broad exploitation observed in the wild.',
      iocs: ['ldap:// or rmi:// lookups', 'jndi:ldap strings in logs', 'Unexpected outbound LDAP traffic'],
      mitigations: [
        'Upgrade Log4j to a fixed version (2.17.1+ for most cases).',
        'Disable message lookups and remove JNDI lookups if upgrade is not immediate.',
        'Restrict outbound LDAP/RMI traffic at the network perimeter.',
        'Rotate credentials and review logs for exploit attempts.',
      ],
      references: [
        'Apache Log4j Security Advisories',
        'NVD CVE-2021-44228',
        'CISA Log4j Guidance',
      ],
      lastUpdated: '2021-12-28',
      confidence: 'high',
      notes: 'Based on widely reported guidance for CVE-2021-44228.',
    };
  }
  if (q.includes('stuxnet')) {
    return {
      summary:
        'Stuxnet is a highly sophisticated cyber-physical malware campaign that targeted industrial control systems (ICS), notably PLCs in nuclear enrichment facilities. It leveraged multiple zero-days and propagation techniques to disrupt physical processes.',
      impact:
        'Significant operational disruption for industrial environments, with high safety and geopolitical risk.',
      knownExploitation: 'active - historical campaign, not currently active as a single unified operation.',
      iocs: ['Malicious PLC logic modifications', 'Unexpected Step7 project changes', 'Unusual USB propagation artifacts'],
      mitigations: [
        'Segment OT/ICS networks from IT environments.',
        'Monitor PLC programming changes and enforce strict access controls.',
        'Apply vendor patches and restrict removable media usage.',
      ],
      references: ['US-CERT ICS advisories', 'Vendor ICS security advisories', 'MITRE ATT&CK for ICS'],
      lastUpdated: 'unknown',
      confidence: 'medium',
      notes: 'General historical summary; validate against current ICS advisories for operational use.',
    };
  }
  return {
    summary:
      `No live AI provider is configured. Add GEMINI_API_KEY to enable enriched intel for "${query}".`,
    impact: 'unknown',
    knownExploitation: 'unknown',
    iocs: [],
    mitigations: ['Configure the AI provider to unlock live enrichment.'],
    references: [],
    lastUpdated: 'unknown',
    confidence: 'low',
    notes: 'AI provider not configured.',
  };
};

const extractText = (data) => {
  const candidate = data?.candidates?.[0];
  const part = candidate?.content?.parts?.[0];
  return part?.text || '';
};

const safeParse = (text) => {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { query } = req.body || {};
  if (!query || typeof query !== 'string') {
    return res.status(400).json({ ok: false, error: 'query is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ ok: true, result: fallbackIntel(query) });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const prompt = buildPrompt(query.trim());
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 650,
        },
      }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(200).json({ ok: true, result: fallbackIntel(query) });
    }

    const text = extractText(data);
    const parsed = safeParse(text);
    if (parsed) {
      return res.status(200).json({ ok: true, result: parsed });
    }
    return res.status(200).json({
      ok: true,
      result: {
        summary: text || 'No response available.',
        impact: 'unknown',
        knownExploitation: 'unknown',
        iocs: [],
        mitigations: [],
        references: [],
        lastUpdated: 'unknown',
        raw: text,
      },
    });
  } catch (error) {
    return res.status(200).json({ ok: true, result: fallbackIntel(query) });
  }
}
