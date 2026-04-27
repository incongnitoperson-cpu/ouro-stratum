import type { Decision, SimulationResult } from './types'

export async function saveDecision(
  db: D1Database,
  data: {
    id: string
    userId: string
    decision: string
    context: string
    horizon: string
    result: SimulationResult
  }
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO decisions (id, user_id, decision, context, horizon, result, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`
    )
    .bind(data.id, data.userId, data.decision, data.context, data.horizon, JSON.stringify(data.result))
    .run()
}

export async function getDecisions(db: D1Database, userId: string): Promise<Decision[]> {
  const result = await db
    .prepare(`SELECT * FROM decisions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50`)
    .bind(userId)
    .all<Decision>()
  return result.results
}

export async function getDecision(db: D1Database, id: string, userId: string): Promise<Decision | null> {
  const result = await db
    .prepare(`SELECT * FROM decisions WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .first<Decision>()
  return result ?? null
}

export async function updateOutcome(
  db: D1Database,
  id: string,
  userId: string,
  outcome: 'good' | 'bad' | 'neutral',
  outcomeNote: string | null
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE decisions SET outcome = ?, outcome_note = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    )
    .bind(outcome, outcomeNote, id, userId)
    .run()
  return (result.meta.changes ?? 0) > 0
}

export async function deleteDecision(db: D1Database, id: string, userId: string): Promise<boolean> {
  const result = await db
    .prepare(`DELETE FROM decisions WHERE id = ? AND user_id = ?`)
    .bind(id, userId)
    .run()
  return (result.meta.changes ?? 0) > 0
}
