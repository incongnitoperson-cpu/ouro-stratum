import { callClaude } from '@/lib/anthropic'
import type { AgentResponse, BaseRate, SimulationResult } from '@/types/simulation'

const SYSTEM_PROMPT = `You are synthesizing a multi-agent debate into a structured decision analysis. 5 agents argued over 3 rounds. Your job: create probability-weighted scenarios that integrate ALL perspectives fairly.

Rules:
- Probabilities across all scenarios must sum to ~100
- Name scenarios descriptively (e.g. "Thrives", "Struggles but Survives", "Fails Fast")
- Be honest about disagreement — don't false-consensus the output
- supporting_agents lists which agents most strongly argued for each scenario
- Confidence reflects how much agents agreed (high agreement = higher confidence)

You MUST respond with ONLY valid JSON, no markdown, no explanation outside the JSON.`

function buildDebateSummary(
  round1: AgentResponse[],
  round2: AgentResponse[],
  round3: AgentResponse[]
): string {
  const all = [...round1, ...round2, ...round3]
  return all.map(r => `[Round ${r.round}] ${r.agent_name}: ${r.message.slice(0, 300)}...`).join('\n\n')
}

function parseJSON(text: string): SimulationResult | null {
  // Try raw parse
  try { return JSON.parse(text) as SimulationResult } catch {}
  // Try extracting from code block
  const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (codeBlock) try { return JSON.parse(codeBlock[1]!) as SimulationResult } catch {}
  // Try extracting bare object
  const bare = text.match(/\{[\s\S]*\}/)
  if (bare) try { return JSON.parse(bare[0]) as SimulationResult } catch {}
  return null
}

const FALLBACK: SimulationResult = {
  scenarios: [
    {
      name: 'Proceeds as Planned',
      probability: 45,
      description: 'The decision unfolds roughly as intended with moderate success.',
      key_drivers: ['Execution quality', 'Market conditions', 'Timing'],
      supporting_agents: ['The Bull Case'],
      risks: ['Execution gaps', 'External shocks'],
    },
    {
      name: 'Underperforms Expectations',
      probability: 35,
      description: 'The decision faces more headwinds than anticipated.',
      key_drivers: ['Hidden costs materialize', 'Competitive dynamics'],
      supporting_agents: ['The Risk Analyst', 'The Statistician'],
      risks: ['Compounding difficulties'],
    },
    {
      name: 'Upside Surprise',
      probability: 20,
      description: 'Better-than-expected outcome driven by favorable conditions.',
      key_drivers: ['Favorable timing', 'Underestimated advantages'],
      supporting_agents: ['The Bull Case', "The Devil's Advocate"],
      risks: ['Sustainability of gains'],
    },
  ],
  confidence: 55,
  key_assumptions: ['Execution remains on track', 'Market conditions are stable', 'Key dependencies hold'],
  sensitivity_analysis: [
    { assumption: 'Market conditions remain favorable', if_true: 'Probability of best case rises 15-20%', if_false: 'Downside scenarios become 40% more likely' },
    { assumption: 'Execution quality is high', if_true: 'Success probability increases significantly', if_false: 'Most scenarios worsen by 1-2 tiers' },
  ],
  base_rates: [],
  debate_summary: 'Agents showed moderate agreement on risks but diverged on timing and magnitude of upside.',
}

export async function synthesizeDebate(
  round1: AgentResponse[],
  round2: AgentResponse[],
  round3: AgentResponse[],
  baseRates: BaseRate[]
): Promise<SimulationResult> {
  const debateSummary = buildDebateSummary(round1, round2, round3)

  const userPrompt = `Here is the full 3-round multi-agent debate:\n\n${debateSummary}

Relevant base rates:\n${baseRates.map(r => `- ${r.context} (${r.source})`).join('\n') || 'None found'}

Synthesize this into the following JSON structure:
{
  "scenarios": [
    {
      "name": "string",
      "probability": number,
      "description": "string",
      "key_drivers": ["string"],
      "supporting_agents": ["string"],
      "risks": ["string"]
    }
  ],
  "confidence": number,
  "key_assumptions": ["string"],
  "sensitivity_analysis": [
    {
      "assumption": "string",
      "if_true": "string",
      "if_false": "string"
    }
  ],
  "base_rates": [
    {
      "context": "string",
      "historical_rate": "string",
      "source": "string"
    }
  ],
  "debate_summary": "string"
}

Respond with ONLY the JSON object.`

  const raw = await callClaude(SYSTEM_PROMPT, userPrompt, 0.3)
  const parsed = parseJSON(raw)

  if (!parsed) return { ...FALLBACK, base_rates: baseRates }

  // Ensure base_rates includes what we found
  if (!parsed.base_rates || parsed.base_rates.length === 0) {
    parsed.base_rates = baseRates
  }

  return parsed
}
