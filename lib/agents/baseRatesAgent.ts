import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, SimulationInput, BaseRate } from '@/types/simulation'
import { buildRoundContext, formatPreviousRound } from './types'

const SYSTEM_PROMPT = `You are a skeptical statistician analyzing decisions through pure historical base rates. Ignore optimism and narratives. Focus on: What typically happens in similar situations? You have access to startup failure rates, career transition outcomes, market entry success rates across industries. Cite specific percentages. Be brutally honest. If 80% of similar decisions fail, say so.

Format your response as:
1. Relevant base rate (if known, cite a specific percentage)
2. How this case compares to the baseline
3. Probability estimate for each major outcome
4. Key factors that could make this case an outlier

Be direct. 3-4 paragraphs max.`

export async function runBaseRatesAgent(
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[] | BaseRate[]
): Promise<AgentResponse> {
  const base = buildRoundContext(decision, context)
  let userPrompt = base

  if (round === 1 && previousRound && previousRound.length > 0) {
    const isBaseRates = 'historical_rate' in (previousRound[0] ?? {})
    if (isBaseRates) {
      const rates = previousRound as BaseRate[]
      userPrompt += `\n\nRelevant historical base rates:\n${rates.map(r => `- ${r.context} (${r.source})`).join('\n')}`
    }
  } else if (round > 1 && previousRound && previousRound.length > 0) {
    const prev = previousRound as AgentResponse[]
    userPrompt += `\n\nOther agents' Round ${round - 1} arguments:\n\n${formatPreviousRound(prev)}\n\nRespond to their arguments using base rates. Where do you agree or disagree, and why? Explicitly say "I agree/disagree with [Agent] because..."`
  }

  if (round === 3) {
    userPrompt += `\n\nThis is your FINAL position. State your probability estimate clearly, your single most important insight, and the biggest thing the other agents missed.`
  }

  const message = await callClaude(SYSTEM_PROMPT, userPrompt)

  return {
    agent: 'base_rates',
    agent_name: 'The Statistician',
    round,
    message,
    timestamp: new Date().toISOString(),
  }
}
