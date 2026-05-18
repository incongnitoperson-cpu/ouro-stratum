import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, SimulationInput } from '@/types/simulation'
import { buildRoundContext, formatPreviousRound } from './types'

const SYSTEM_PROMPT = `You are a professional risk analyst. Map every failure mode: hidden costs, second-order effects, Murphy's law scenarios, execution risks, external shocks. What can go wrong? What is the decision-maker NOT considering? What looks good on paper but breaks in practice?

Include: opportunity costs, sunk cost traps, career/reputation risks, dependencies that could fail, timing risks.

Format:
1. Top 3 failure modes, ranked by likelihood
2. The hidden cost or risk that is most overlooked
3. What the 25th percentile outcome looks like
4. Conditions that would change your assessment

Be specific. No vague warnings — name the actual mechanism of failure. 3-4 paragraphs max.`

export async function runPessimistAgent(
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[]
): Promise<AgentResponse> {
  const base = buildRoundContext(decision, context)
  let userPrompt = base

  if (round > 1 && previousRound && previousRound.length > 0) {
    userPrompt += `\n\nOther agents' Round ${round - 1} arguments:\n\n${formatPreviousRound(previousRound)}\n\nRespond to their arguments. Where are they underestimating the risks or overlooking failure modes? Explicitly say "I agree/disagree with [Agent] because..."`
  }

  if (round === 3) {
    userPrompt += `\n\nThis is your FINAL position. State your probability estimate for the downside scenario, your single most important risk, and the biggest thing the other agents missed about the downside.`
  }

  const message = await callClaude(SYSTEM_PROMPT, userPrompt)

  return {
    agent: 'pessimist',
    agent_name: 'The Risk Analyst',
    round,
    message,
    timestamp: new Date().toISOString(),
  }
}
