// Live market data proxy for RiskDesk. Pulls real series from FRED
// (Federal Reserve Economic Data). FRED_API_KEY lives only in Vercel env vars.
// Long-history series feed the VaR engine; short series feed current levels.
const SERIES = {
  // risk factor history (~1 year of daily observations)
  y10:    { id: 'DGS10',          limit: 280 }, // 10Y treasury yield
  oasIG:  { id: 'BAMLC0A0CM',     limit: 280 }, // IG corporate OAS
  oasHY:  { id: 'BAMLH0A0HYM2',   limit: 280 }, // HY corporate OAS
  sp500:  { id: 'SP500',          limit: 280 }, // equity factor
  // current levels / curve
  y3m:    { id: 'DGS3MO',         limit: 15 },
  y2:     { id: 'DGS2',           limit: 15 },
  y5:     { id: 'DGS5',           limit: 15 },
  y30:    { id: 'DGS30',          limit: 15 },
  vix:    { id: 'VIXCLS',         limit: 40 },
  fedfunds:{ id: 'FEDFUNDS',      limit: 4 }
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600');

  const key = process.env.FRED_API_KEY;
  if (!key) return res.status(200).json({ live: false, series: {} });

  try {
    const out = {};
    await Promise.all(Object.entries(SERIES).map(async ([name, cfg]) => {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${cfg.id}&api_key=${key}&file_type=json&sort_order=desc&limit=${cfg.limit}`;
      const r = await fetch(url);
      if (!r.ok) { out[name] = []; return; }
      const j = await r.json();
      out[name] = (j.observations || [])
        .filter(o => o.value !== '.')
        .map(o => ({ date: o.date, value: parseFloat(o.value) }))
        .reverse();
    }));
    res.status(200).json({ live: true, series: out });
  } catch (err) {
    res.status(200).json({ live: false, series: {}, detail: err.message });
  }
}
