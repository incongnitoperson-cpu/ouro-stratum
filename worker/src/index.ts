import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from './types'
import { requireAuth } from './auth'
import { runSimulation } from './simulation'
import { saveDecision, getDecisions, getDecision, updateOutcome, deleteDecision } from './db'

type Variables = { userId: string }

const app = new Hono<{ Bindings: Env; Variables: Variables }>()

app.use('*', async (c, next) => {
  const allowedOrigins = (c.env.ALLOWED_ORIGINS ?? 'http://localhost:5173').split(',')
  return cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })(c, next)
})

app.get('/api/health', c => c.json({ ok: true, env: c.env.ENVIRONMENT }))

app.post('/api/simulate', requireAuth, async c => {
  const body = await c.req.json<{ decision?: string; context?: string; horizon?: string }>()

  if (!body.decision?.trim() || !body.context?.trim() || !body.horizon?.trim()) {
    return c.json({ error: 'decision, context, and horizon are required' }, 400)
  }

  const request = {
    decision: body.decision.trim(),
    context: body.context.trim(),
    horizon: body.horizon.trim(),
  }

  const result = await runSimulation(request, c.env)

  const id = crypto.randomUUID()
  await saveDecision(c.env.DB, {
    id,
    userId: c.get('userId'),
    decision: request.decision,
    context: request.context,
    horizon: request.horizon,
    result,
  })

  return c.json({ id, result })
})

app.get('/api/decisions', requireAuth, async c => {
  const decisions = await getDecisions(c.env.DB, c.get('userId'))
  return c.json({ decisions })
})

app.get('/api/decisions/:id', requireAuth, async c => {
  const decision = await getDecision(c.env.DB, c.req.param('id'), c.get('userId'))
  if (!decision) return c.json({ error: 'Not found' }, 404)
  return c.json({ decision })
})

app.patch('/api/decisions/:id/outcome', requireAuth, async c => {
  const body = await c.req.json<{ outcome?: string; outcomeNote?: string }>()

  if (!body.outcome || !['good', 'bad', 'neutral'].includes(body.outcome)) {
    return c.json({ error: 'outcome must be good, bad, or neutral' }, 400)
  }

  const updated = await updateOutcome(
    c.env.DB,
    c.req.param('id'),
    c.get('userId'),
    body.outcome as 'good' | 'bad' | 'neutral',
    body.outcomeNote ?? null
  )

  if (!updated) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

app.delete('/api/decisions/:id', requireAuth, async c => {
  const deleted = await deleteDecision(c.env.DB, c.req.param('id'), c.get('userId'))
  if (!deleted) return c.json({ error: 'Not found' }, 404)
  return c.json({ ok: true })
})

export default app
