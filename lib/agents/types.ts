import type { AgentResponse, SimulationInput, BaseRate } from '@/types/simulation'

export type AgentRunner = (
  decision: string,
  context: SimulationInput['context'],
  round: 1 | 2 | 3,
  previousRound?: AgentResponse[] | BaseRate[]
) => Promise<AgentResponse>

export function buildRoundContext(
  decision: string,
  context: SimulationInput['context'],
  previousRound?: AgentResponse[] | BaseRate[]
): string {
  const contextStr = [
    context.age ? `Age/Stage: ${context.age}` : null,
    context.timeline ? `Time Horizon: ${context.timeline}` : null,
    context.notes ? `Additional Context: ${context.notes}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  return `Decision: ${decision}${contextStr ? '\n\n' + contextStr : ''}`
}

export function formatPreviousRound(previousRound: AgentResponse[]): string {
  return previousRound
    .map(r => `**${r.agent_name}**: ${r.message}`)
    .join('\n\n---\n\n')
}
