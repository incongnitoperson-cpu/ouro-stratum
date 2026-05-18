export type AgentId = 'base_rates' | 'optimist' | 'pessimist' | 'contrarian' | 'expert'

export interface SimulationInput {
  decision: string
  context: {
    age?: string
    timeline?: '6mo' | '1yr' | '3yr' | '5yr'
    notes?: string
  }
  tier: 'personal' | 'corporate' | 'government'
}

export interface AgentResponse {
  agent: AgentId
  agent_name: string
  round: 1 | 2 | 3
  message: string
  probability_estimate?: number
  timestamp: string
}

export interface Scenario {
  name: string
  probability: number
  description: string
  key_drivers: string[]
  supporting_agents: string[]
  risks: string[]
}

export interface SensitivityItem {
  assumption: string
  if_true: string
  if_false: string
}

export interface BaseRate {
  context: string
  historical_rate: string
  source: string
}

export interface SimulationResult {
  scenarios: Scenario[]
  confidence: number
  key_assumptions: string[]
  sensitivity_analysis: SensitivityItem[]
  base_rates: BaseRate[]
  debate_summary: string
}

export interface SimulationResponse {
  scenarios: Scenario[]
  debate_transcript: {
    round1: AgentResponse[]
    round2: AgentResponse[]
    round3: AgentResponse[]
  }
  confidence: number
  sensitivity_analysis: SensitivityItem[]
  base_rates: BaseRate[]
  key_assumptions: string[]
  debate_summary: string
  metadata: {
    simulations: string
    horizon: string
    agents: number
    rounds: number
  }
}
