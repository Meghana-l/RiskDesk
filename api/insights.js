// Serverless proxy for Groq. GROQ_API_KEY lives only in Vercel env vars.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { snapshot } = req.body || {};
    if (!snapshot) return res.status(400).json({ error: 'Missing risk snapshot' });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 900,
        messages: [
          {
            role: 'system',
            content: [
              'You are a senior risk manager on the independent risk oversight team of a global asset manager.',
              'You receive a JSON snapshot of the fund complex: per-fund VaR and limit utilization, stress test results, fixed income exposures, drawdown levels, and current market conditions.',
              'Write the daily risk commentary that goes to senior risk management. Respond in exactly two sections with these headings:',
              '## Daily Risk Commentary',
              'Four short, numbered observations. Each must cite specific numbers from the snapshot, connect fund exposures to current market conditions, and read like independent risk oversight, not marketing. Flag anything close to a limit.',
              '## Items for Escalation',
              'Two or three numbered items requiring attention, each formatted as: **Item** (Urgency: High/Medium/Low) followed by one sentence on the recommended action and which stakeholder to engage (portfolio manager, controllers, or the board).',
              'Plain markdown only. No preamble, no closing remarks.'
            ].join('\n')
          },
          {
            role: 'user',
            content: 'Fund complex risk snapshot:\n' + JSON.stringify(snapshot, null, 2)
          }
        ]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(502).json({ error: 'Model call failed', detail: data.error?.message || 'Unknown error' });
    }
    res.status(200).json({ text: data.choices?.[0]?.message?.content || '' });
  } catch (err) {
    res.status(500).json({ error: 'Commentary generation failed', detail: err.message });
  }
}
