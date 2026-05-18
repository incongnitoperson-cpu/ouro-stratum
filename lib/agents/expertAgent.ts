import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, SimulationInput } from '@/types/simulation'
import { buildRoundContext, formatPreviousRound } from './types'

function inferDomain(decision: string, notes = ''): string {
  const text = `${decision} ${notes}`.toLowerCase()

  if (/startup|found|saas|b2b|b2c|product-market|pmf|venture|seed|series|fundrais/.test(text))
    return 'startups and venture capital — VC funding dynamics, burn rate norms, PMF signals, hiring markets, runway, dilution'
  if (/invest|stock|equit|portfolio|fund|hedge|reit|crypto|bitcoin|asset/.test(text))
    return 'investment and finance — asset allocation, risk-adjusted returns, tax implications, liquidity, market cycles'
  if (/real estate|property|house|apartment|landlord|rental|mortgage|reit/.test(text))
    return 'real estate — market cycles, cap rates, financing structures, property management, appreciation dynamics'
  if (/career|job|salary|promotion|manager|executive|hire|recruit|comp|linkedin/.test(text))
    return 'career development and labor markets — industry hiring cycles, comp bands, credential signaling, career capital'
  if (/country|geopolit|government|policy|election|war|sanction|alliance|diplomat/.test(text))
    return 'geopolitics and policy — historical precedents, institutional incentives, second-order alliances, risk premium'
  if (/health|medical|hospital|doctor|drug|treatment|clinical|pharma|biotech/.test(text))
    return 'healthcare and medicine — clinical evidence quality, regulatory timelines, payor dynamics, implementation challenges'
  if (/crypto|defi|web3|blockchain|nft|protocol|token|dao/.test(text))
    return 'crypto and decentralized finance — on-chain dynamics, regulatory risk, liquidity, protocol mechanics, market cycles'
  if (/education|school|degree|mba|university|credential|course|bootcamp/.test(text))
    return 'education and credentialing — ROI on degrees, signaling vs skill, labor market outcomes, alternative paths'

  return 'business strategy and decision-making — organizational dynamics, execution challenges, market timing, competitive positioning'
}

export async function runExpertAgent(
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[]
): Promise<AgentResponse> {
  const domain = inferDomain(decision, context.notes)

  const systemPrompt = `You have deep insider knowledge in: ${domain}. Your job is to bring information asymmetry — what do people in this field know that outsiders don't?

Examples of insider knowledge:
- Hidden industry norms that change the math
- What the statistics miss (survivorship bias, selection effects)
- Timing and sequencing that only practitioners know
- The real gatekeepers vs the apparent ones
- What signals actually matter vs what people think matter

Format:
1. The insider insight that most changes this analysis
2. What outsiders systematically get wrong about this domain
3. The specific domain knowledge that is most relevant here
4. Your probability-adjusted view given domain context

Be specific with insider details. 3-4 paragraphs max.`

  const base = buildRoundContext(decision, context)
  let userPrompt = base

  if (round > 1 && previousRound && previousRound.length > 0) {
    userPrompt += `\n\nOther agents' Round ${round - 1} arguments:\n\n${formatPreviousRound(previousRound)}\n\nAdd your domain expertise. What are they getting wrong because they don't have insider knowledge of ${domain}? Explicitly say "I agree/disagree with [Agent] because..."`
  }

  if (round === 3) {
    userPrompt += `\n\nThis is your FINAL position. State the single most important insider insight, and the biggest domain-specific thing all other agents missed.`
  }

  const message = await callClaude(systemPrompt, userPrompt)

  return {
    agent: 'expert',
    agent_name: 'The Domain Specialist',
    round,
    message,
    timestamp: new Date().toISOString(),
  }
}
