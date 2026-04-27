import Anthropic from '@anthropic-ai/sdk'
import type { Env, SimulationRequest, SimulationResult, AgentOutput } from './types'
import { AGENTS } from './agents'
import { searchContext } from './search'
import { getRelevantReference } from './reference'

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  anthropic: Anthropic,
  model: string,
  maxTokens = 800
): Promise<string> {
  const res = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  return res.content[0]?.type === 'text' ? res.content[0].text : ''
}

function parseAgentJSON(text: string): { analysis: string; keyPoints: string[] } {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0]) as { analysis?: string; keyPoints?: string[] }
      return {
        analysis: parsed.analysis ?? text,
        keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints : [],
      }
    }
  } catch {}
  return { analysis: text, keyPoints: [] }
}

async function runRound1Agent(
  agent: (typeof AGENTS)[0],
  request: SimulationRequest,
  externalContext: string[],
  anthropic: Anthropic,
  model: string
): Promise<AgentOutput> {
  const refData = getRelevantReference(agent.name)
  const extCtx =
    externalContext.length > 0 ? `External Context:\n${externalContext.slice(0, 3).join('\n')}\n\n` : ''

  const userMessage = `Analyze this decision from your perspective:

Decision: ${request.decision}
Context: ${request.context}
Time Horizon: ${request.horizon}

${extCtx}Relevant Reference Data:
${refData}

Respond ONLY with valid JSON:
{
  "analysis": "Your analysis in 2-3 focused paragraphs",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
}`

  const text = await callClaude(agent.systemPrompt, userMessage, anthropic, model)
  const { analysis, keyPoints } = parseAgentJSON(text)
  return { name: agent.name, perspective: agent.role, analysis, keyPoints }
}

async function runRound2Agent(
  agent: (typeof AGENTS)[0],
  request: SimulationRequest,
  round1Outputs: AgentOutput[],
  anthropic: Anthropic,
  model: string
): Promise<AgentOutput> {
  const otherSummaries = round1Outputs
    .filter(o => o.name !== agent.name)
    .map(o => `**${o.name}**: ${o.analysis.substring(0, 350)}`)
    .join('\n\n')

  const userMessage = `Round 2. Same decision, but now you've seen what other agents found.

Decision: ${request.decision}
Context: ${request.context}
Time Horizon: ${request.horizon}

Other agents' Round 1 analyses:
${otherSummaries}

Refine your analysis. Where do you agree or disagree? What did others miss from your angle? Update your position based on what you learned, but stay in your lane.

Respond ONLY with valid JSON:
{
  "analysis": "Your refined analysis in 2-3 focused paragraphs",
  "keyPoints": ["Point 1", "Point 2", "Point 3", "Point 4", "Point 5"]
}`

  const text = await callClaude(agent.systemPrompt, userMessage, anthropic, model)
  const { analysis, keyPoints } = parseAgentJSON(text)
  return { name: agent.name, perspective: agent.role, analysis, keyPoints }
}

async function synthesize(
  request: SimulationRequest,
  round2Outputs: AgentOutput[],
  anthropic: Anthropic,
  model: string
): Promise<{
  summary: string
  recommendation: string
  confidence: number
  topRisks: string[]
  topOpportunities: string[]
  keyTension: string
}> {
  const agentSummaries = round2Outputs
    .map(o => `**${o.name}** (${o.perspective}):\n${o.keyPoints.map(p => `- ${p}`).join('\n')}`)
    .join('\n\n')

  const systemPrompt = `You are the synthesis engine for a multi-agent decision analysis. Distill 6 agent perspectives into a clear, actionable final recommendation. Be direct and specific. No hedging, no vague advice.`

  const userMessage = `Synthesize these 6 agent analyses into a final recommendation:

Decision: ${request.decision}
Time Horizon: ${request.horizon}

Agent Key Points:
${agentSummaries}

Respond ONLY with valid JSON:
{
  "summary": "2-3 sentence synthesis of what the agents collectively found",
  "recommendation": "One clear, actionable recommendation with specific reasoning",
  "confidence": 0.70,
  "topRisks": ["Specific risk 1", "Specific risk 2", "Specific risk 3"],
  "topOpportunities": ["Specific opportunity 1", "Specific opportunity 2", "Specific opportunity 3"],
  "keyTension": "The core trade-off this decision forces"
}`

  const text = await callClaude(systemPrompt, userMessage, anthropic, model, 1000)

  try {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      const parsed = JSON.parse(match[0]) as {
        summary?: string
        recommendation?: string
        confidence?: number
        topRisks?: string[]
        topOpportunities?: string[]
        keyTension?: string
      }
      return {
        summary: parsed.summary ?? '',
        recommendation: parsed.recommendation ?? '',
        confidence: parsed.confidence ?? 0.65,
        topRisks: Array.isArray(parsed.topRisks) ? parsed.topRisks : [],
        topOpportunities: Array.isArray(parsed.topOpportunities) ? parsed.topOpportunities : [],
        keyTension: parsed.keyTension ?? '',
      }
    }
  } catch {}

  return {
    summary: 'Analysis complete. Review individual agent outputs for details.',
    recommendation: 'See agent analyses above.',
    confidence: 0.5,
    topRisks: [],
    topOpportunities: [],
    keyTension: '',
  }
}

export async function runSimulation(request: SimulationRequest, env: Env): Promise<SimulationResult> {
  const anthropic = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY })
  const model = env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

  // External context + Round 1 in parallel to save wall time
  const [externalContext, ...round1Outputs] = await Promise.all([
    searchContext(request.decision),
    ...AGENTS.map(agent => runRound1Agent(agent, request, [], anthropic, model)),
  ])

  // Round 2: agents see each other's round 1 outputs
  const round2Outputs = await Promise.all(
    AGENTS.map(agent => runRound2Agent(agent, request, round1Outputs, anthropic, model))
  )

  // Final synthesis
  const synthesis = await synthesize(request, round2Outputs, anthropic, model)

  return {
    summary: synthesis.summary,
    recommendation: synthesis.recommendation,
    confidence: synthesis.confidence,
    topRisks: synthesis.topRisks,
    topOpportunities: synthesis.topOpportunities,
    keyTension: synthesis.keyTension,
    agents: round2Outputs,
    debate: [
      { round: 1, outputs: round1Outputs },
      { round: 2, outputs: round2Outputs },
    ],
    externalContext: {
      query: request.decision,
      results: externalContext,
    },
  }
}
