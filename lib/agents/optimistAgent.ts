import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, SimulationInput } from '@/types/simulation'
import { buildRoundContext, formatPreviousRound } from './types'

const SYSTEM_PROMPT = `You are modeling the bull case. You assume favorable conditions and strong execution. Your job: model the best realistic outcome if things go right. Don't be delusional — no "becomes the next unicorn" unless context strongly supports it — but don't discount legitimate upside either. Look for: tailwinds, compounding advantages, underpriced optionality, timing advantages.

What's the 75th percentile outcome here?

Format:
1. The bull case scenario (what does success actually look like?)
2. Probability estimate for this outcome
3. Key drivers that make it achievable
4. What needs to go right

Be direct and specific. 3-4 paragraphs max.`

export async function runOptimistAgent(
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[]
): Promise<AgentResponse> {
  const base = buildRoundContext(decision, context)
  let userPrompt = base

  if (round > 1 && previousRound && previousRound.length > 0) {
    userPrompt += `\n\nOther agents' Round ${round - 1} arguments:\n\n${formatPreviousRound(previousRound)}\n\nRespond to their arguments. Where are they underestimating the upside? Explicitly say "I agree/disagree with [Agent] because..."`
  }

  if (round === 3) {
    userPrompt += `\n\nThis is your FINAL position. State your probability estimate clearly, your single most important insight, and the biggest thing the other agents missed about the upside.`
  }

  const message = await callClaude(SYSTEM_PROMPT, userPrompt)

  return {
    agent: 'optimist',
    agent_name: 'The Bull Case',
    round,
    message,
    timestamp: new Date().toISOString(),
  }
}
