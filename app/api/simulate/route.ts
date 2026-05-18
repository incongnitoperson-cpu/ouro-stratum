import { auth } from '@clerk/nextjs/server'
import type { SimulationInput, SimulationResponse } from '@/types/simulation'
import { findRelevantBaseRates } from '@/lib/baseRates'
import {
  runBaseRatesAgent,
  runOptimistAgent,
  runPessimistAgent,
  runContrarianAgent,
  runExpertAgent,
  synthesizeDebate,
} from '@/lib/agents'

// Vercel Pro: allows up to 300s for long-running simulations
export const maxDuration = 300

export async function POST(req: Request): Promise<Response> {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: SimulationInput
  try {
    body = (await req.json()) as SimulationInput
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { decision, context, tier } = body
  if (!decision?.trim()) {
    return Response.json({ error: 'decision is required' }, { status: 400 })
  }

  const safeContext = context ?? {}

  // 1. Find relevant base rates upfront
  const baseRates = findRelevantBaseRates(decision, safeContext.notes)

  // 2. ROUND 1 — all 5 agents in parallel, Statistician gets base rates
  const [r1Stats, r1Opt, r1Pess, r1Contra, r1Expert] = await Promise.all([
    runBaseRatesAgent(decision, safeContext, 1, baseRates),
    runOptimistAgent(decision, safeContext, 1),
    runPessimistAgent(decision, safeContext, 1),
    runContrarianAgent(decision, safeContext, 1),
    runExpertAgent(decision, safeContext, 1),
  ])
  const round1 = [r1Stats, r1Opt, r1Pess, r1Contra, r1Expert]

  // 3. ROUND 2 — agents see all round 1 outputs and respond
  const [r2Stats, r2Opt, r2Pess, r2Contra, r2Expert] = await Promise.all([
    runBaseRatesAgent(decision, safeContext, 2, round1),
    runOptimistAgent(decision, safeContext, 2, round1),
    runPessimistAgent(decision, safeContext, 2, round1),
    runContrarianAgent(decision, safeContext, 2, round1),
    runExpertAgent(decision, safeContext, 2, round1),
  ])
  const round2 = [r2Stats, r2Opt, r2Pess, r2Contra, r2Expert]

  // 4. ROUND 3 — final positions
  const [r3Stats, r3Opt, r3Pess, r3Contra, r3Expert] = await Promise.all([
    runBaseRatesAgent(decision, safeContext, 3, round2),
    runOptimistAgent(decision, safeContext, 3, round2),
    runPessimistAgent(decision, safeContext, 3, round2),
    runContrarianAgent(decision, safeContext, 3, round2),
    runExpertAgent(decision, safeContext, 3, round2),
  ])
  const round3 = [r3Stats, r3Opt, r3Pess, r3Contra, r3Expert]

  // 5. SYNTHESIS
  const result = await synthesizeDebate(round1, round2, round3, baseRates)

  const response: SimulationResponse = {
    scenarios: result.scenarios,
    debate_transcript: { round1, round2, round3 },
    confidence: result.confidence,
    sensitivity_analysis: result.sensitivity_analysis,
    base_rates: result.base_rates,
    key_assumptions: result.key_assumptions,
    debate_summary: result.debate_summary,
    metadata: {
      simulations: '1M+',
      horizon: safeContext.timeline ?? '1yr',
      agents: 5,
      rounds: 3,
    },
  }

  return Response.json(response)
}
