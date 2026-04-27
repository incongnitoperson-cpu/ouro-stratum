import type { Decision, SimulationResult } from './types'

const API_URL = import.meta.env.VITE_API_URL ?? ''

async function request<T>(
  path: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string }
    throw new Error(err.error ?? res.statusText)
  }

  return res.json() as Promise<T>
}

export async function simulate(
  token: string,
  data: { decision: string; context: string; horizon: string }
): Promise<{ id: string; result: SimulationResult }> {
  return request('/api/simulate', token, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getDecisions(token: string): Promise<{ decisions: Decision[] }> {
  return request('/api/decisions', token)
}

export async function getDecision(token: string, id: string): Promise<{ decision: Decision }> {
  return request(`/api/decisions/${id}`, token)
}

export async function updateOutcome(
  token: string,
  id: string,
  outcome: 'good' | 'bad' | 'neutral',
  outcomeNote?: string
): Promise<void> {
  await request(`/api/decisions/${id}/outcome`, token, {
    method: 'PATCH',
    body: JSON.stringify({ outcome, outcomeNote }),
  })
}

export async function deleteDecision(token: string, id: string): Promise<void> {
  await request(`/api/decisions/${id}`, token, { method: 'DELETE' })
}
