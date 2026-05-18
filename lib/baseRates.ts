import type { BaseRate } from '@/types/simulation'

interface BaseRateEntry {
  rate: number
  context: string
  source: string
  keywords: string[]
}

const DB: Record<string, BaseRateEntry[]> = {
  startup: [
    { rate: 0.15, context: '15% of pre-seed startups raise a seed round', source: 'CB Insights 2024', keywords: ['startup', 'founder', 'pre-seed', 'angel', 'idea stage'] },
    { rate: 0.10, context: '10% of seed startups raise a Series A', source: 'CB Insights 2024', keywords: ['seed', 'series a', 'raise', 'fundraise', 'vc'] },
    { rate: 0.22, context: '22% of startups survive 5+ years', source: 'Bureau of Labor Statistics', keywords: ['startup', 'business', 'venture', 'company', 'launch'] },
    { rate: 0.40, context: '40% of startups ever reach profitability', source: 'Startup Genome 2023', keywords: ['profitable', 'profitability', 'revenue', 'startup', 'business'] },
    { rate: 0.67, context: '67% of startups that raise VC fail to return 1x capital', source: 'Correlation Ventures', keywords: ['startup', 'venture capital', 'investor', 'vc', 'funding'] },
    { rate: 0.03, context: '3% of VC-backed startups reach $100M+ revenue', source: 'First Round Capital', keywords: ['scale', 'grow', 'revenue', 'hundred million', 'unicorn'] },
  ],
  career: [
    { rate: 0.35, context: '35% of employees who quit to found a company report the transition as successful', source: 'Harvard Business Review 2022', keywords: ['quit', 'leave', 'resign', 'job', 'founding', 'start a company'] },
    { rate: 0.60, context: '60% of founders return to employment within 2 years of shutting down', source: 'Kauffman Foundation', keywords: ['shut down', 'failed startup', 'return to work', 'employment'] },
    { rate: 0.45, context: '45% of major career pivots meet initial goals within 3 years', source: 'McKinsey Career Research 2023', keywords: ['career change', 'pivot', 'switch industries', 'new field', 'career pivot'] },
    { rate: 0.30, context: '30% of people who take a pay cut for a new opportunity recover it within 2 years', source: 'LinkedIn Economic Graph', keywords: ['pay cut', 'lower salary', 'compensation', 'tradeoff'] },
    { rate: 0.78, context: '78% of people who report job satisfaction cite role fit over compensation', source: 'Gallup 2023', keywords: ['job satisfaction', 'fulfillment', 'meaning', 'work', 'career'] },
  ],
  market_entry: [
    { rate: 0.30, context: '30% of geographic expansions meet 12-month revenue targets', source: 'Gartner Market Expansion Study 2023', keywords: ['expand', 'new market', 'geography', 'international', 'new country'] },
    { rate: 0.25, context: '25% of new product lines are profitable within 3 years', source: 'Nielsen Product Launch Research', keywords: ['new product', 'launch', 'product line', 'market entry'] },
    { rate: 0.44, context: '44% of companies entering adjacent markets succeed on first attempt', source: 'Bain & Company', keywords: ['adjacent market', 'diversify', 'new segment', 'expand product'] },
  ],
  investment: [
    { rate: 0.20, context: '20% of active retail investors beat the S&P 500 over 10 years', source: 'SPIVA Scorecard 2023', keywords: ['invest', 'stock', 'portfolio', 'market', 'trading', 'beat the market'] },
    { rate: 0.15, context: '15% of angel investments return 10x+', source: 'Angel Capital Association', keywords: ['angel', 'invest', 'early stage', 'equity', 'startup investment'] },
    { rate: 0.50, context: '50% of real estate investors outperform equivalent index fund returns after 10 years', source: 'NAREIT 2023', keywords: ['real estate', 'property', 'house', 'rental', 'invest in property'] },
  ],
  personal: [
    { rate: 0.40, context: '40% of major life relocations are rated as "definitely worth it" in hindsight', source: 'Census Bureau Survey 2022', keywords: ['move', 'relocate', 'new city', 'new country', 'migration'] },
    { rate: 0.55, context: '55% of graduate degree holders report the ROI as positive after 7 years', source: 'Federal Reserve Bank of New York 2023', keywords: ['grad school', 'mba', 'masters', 'phd', 'degree', 'education'] },
    { rate: 0.35, context: '35% of people who take sabbaticals return to equivalent or better compensation', source: 'Harvard Business Review 2022', keywords: ['sabbatical', 'break', 'time off', 'leave of absence'] },
  ],
}

export function findRelevantBaseRates(decision: string, notes = ''): BaseRate[] {
  const text = `${decision} ${notes}`.toLowerCase()
  const matches: BaseRate[] = []

  for (const entries of Object.values(DB)) {
    for (const entry of entries) {
      if (entry.keywords.some(kw => text.includes(kw))) {
        matches.push({
          context: entry.context,
          historical_rate: `${Math.round(entry.rate * 100)}%`,
          source: entry.source,
        })
      }
    }
  }

  // Dedupe and cap at 6
  const seen = new Set<string>()
  return matches.filter(m => {
    if (seen.has(m.context)) return false
    seen.add(m.context)
    return true
  }).slice(0, 6)
}
