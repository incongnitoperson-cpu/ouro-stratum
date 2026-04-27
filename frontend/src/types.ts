export interface AgentOutput {
  name: string
  perspective: string
  analysis: string
  keyPoints: string[]
}

export interface DebateRound {
  round: number
  outputs: AgentOutput[]
}

export interface SimulationResult {
  summary: string
  recommendation: string
  confidence: number
  topRisks: string[]
  topOpportunities: string[]
  keyTension: string
  agents: AgentOutput[]
  debate: DebateRound[]
  externalContext: { query: string; results: string[] }
}

export interface Decision {
  id: string
  user_id: string
  decision: string
  context: string
  horizon: string
  result: string | null
  outcome: 'good' | 'bad' | 'neutral' | null
  outcome_note: string | null
  created_at: string
  updated_at: string
}
