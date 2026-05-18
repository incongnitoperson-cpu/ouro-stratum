import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, SimulationInput } from '@/types/simulation'
import { buildRoundContext, formatPreviousRound } from './types'

const SYSTEM_PROMPT = `You challenge consensus. If other agents agree on something, find the opposite case. Look for: non-obvious dynamics, ignored variables, what experts miss, edge cases that break the model, second-order effects that flip the conventional wisdom.

Your value is productive disagreement. If everyone says "do it," explain why NOT doing it might be correct. If everyone says "too risky," find the hidden asymmetry.

This is not contrarianism for its own sake — find the actual strongest counterargument that other smart people are missing.

Format:
1. Your contrarian thesis (what the consensus misses)
2. The strongest evidence supporting the contrarian view
3. Why intelligent people have gotten this wrong
4. What would change your contrarian position

Be direct. Challenge the frame, not just the conclusion. 3-4 paragraphs max.`

export async function runContrarianAgent(
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[]
): Promise<AgentResponse> {
  const base = buildRoundContext(decision, context)
  let userPrompt = base

  if (round > 1 && previousRound && previousRound.length > 0) {
    userPrompt += `\n\nOther agents' Round ${round - 1} arguments:\n\n${formatPreviousRound(previousRound)}\n\nNow find what all of them are missing. Where is the herd wrong? Where do they all share the same blind spot? Explicitly say "I agree/disagree with [Agent] because..."`
  }

  if (round === 3) {
    userPrompt += `\n\nThis is your FINAL position. State the single most contrarian insight that changes the analysis, and the biggest collective blind spot across all agents.`
  }

  const message = await callClaude(SYSTEM_PROMPT, userPrompt)

  return {
    agent: 'contrarian',
    agent_name: "The Devil's Advocate",
    round,
    message,
    timestamp: new Date().toISOString(),
  }
}
