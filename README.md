# RiskDesk

Independent fund risk monitoring command center for a multi-strategy asset manager. RiskDesk gives a risk oversight team one screen for the daily job: measuring, monitoring, and reporting risk across a fund complex — market risk, fixed income exposures, stress tests, limit governance, and the daily commentary that goes to senior risk management.

## What it does

Six funds across investment grade, government, high yield, emerging markets debt, global equity, and multi-asset strategies are monitored against a board-approved limit framework. The risk numbers are not decorative: VaR is computed in the browser by historical simulation, applying a trailing year of real market factor moves — Treasury yields, IG and HY credit spreads, and equity returns pulled live from the Federal Reserve — to each fund's factor exposures.

## Features

**Fund Complex Overview**
- Complex-level 1-day VaR at 95% and 99% via historical simulation, with the diversification benefit vs. the sum of standalone VaRs
- Daily P&L distribution histogram with the VaR tail marked
- VaR limit utilization per fund with automatic Within Limit / Watch / Breach status
- Live watch items covering limits, drawdown controls, and concentrations

**Fund Risk Profiles**
- Per-fund NAV, duration, spread duration, equity beta, DV01, VaR 95/99, and trailing-year max drawdown
- Standalone VaR vs. board limits and cumulative P&L paths by fund

**Stress Tests & Scenario Analysis**
- Seven deterministic scenarios: parallel rate shocks (+100/200/300bp), HY spread widening, equity drawdown, a 2020-style flight to quality, and a stagflation combination
- Losses per fund as % of NAV and complex-level dollar impact

**Fixed Income Risk**
- Live Treasury yield curve (3M through 30Y) and 2s10s spread
- IG and HY option-adjusted spreads with a trailing-year history
- Rate sensitivity by fund under a +100bp parallel shift

**Limits & Risk Governance**
- The full limit framework: VaR limits, drawdown controls, issuer and sector concentration, liquidity coverage, and counterparty exposure, each with monitoring frequency and escalation path
- A 90-day breach and exception log, including dynamically detected VaR limit events

**Daily Risk Commentary**
- One click sends the live risk snapshot — utilization, stress results, exposures, market levels — to an LLM risk analyst
- Returns numbered daily commentary citing the actual numbers, plus escalation items with urgency and the stakeholder to engage

## Data Sources

| Layer | Source | Type |
|---|---|---|
| Treasury yields (3M–30Y) | FRED · DGS series | Live API |
| IG corporate OAS | FRED · BAMLC0A0CM | Live API |
| HY corporate OAS | FRED · BAMLH0A0HYM2 | Live API |
| Equity factor | FRED · SP500 | Live API |
| Volatility Index | FRED · VIXCLS | Live API |
| Fund exposures | Modeled multi-strategy complex | Modeled |
| Risk commentary | Groq · llama-3.1-8b-instant | Live API (server-side) |

## Stack

- Vanilla HTML/CSS/JS frontend, no build step
- Client-side risk engine: historical simulation VaR, DV01, drawdown, and stress testing on real factor history
- Chart.js for visualization
- Serverless functions proxy all keyed API calls — no key ever reaches the browser
- Deployed on Vercel
