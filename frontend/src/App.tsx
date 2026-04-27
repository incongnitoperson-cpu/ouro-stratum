import { SignedIn, SignedOut, SignIn, useAuth, UserButton } from '@clerk/react'
import { useState } from 'react'
import type { SimulationResult, Decision } from './types'
import * as api from './api'

const HORIZONS = ['1 week', '1 month', '3 months', '6 months', '1 year', '3 years', '10 years']

export default function App() {
  return (
    <>
      <SignedOut>
        <div className="auth-container">
          <div className="auth-header">
            <h1>Stratum</h1>
            <p>Decision intelligence</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </SignedOut>
      <SignedIn>
        <Dashboard />
      </SignedIn>
    </>
  )
}

function Dashboard() {
  const { getToken } = useAuth()
  const [view, setView] = useState<'simulate' | 'history'>('simulate')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{ id: string; result: SimulationResult } | null>(null)
  const [decisions, setDecisions] = useState<Decision[] | null>(null)
  const [form, setForm] = useState({ decision: '', context: '', horizon: '1 year' })

  async function handleSimulate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.decision.trim() || !form.context.trim()) return
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const res = await api.simulate(token, form)
      setResult(res)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  async function loadHistory() {
    setView('history')
    if (decisions !== null) return
    try {
      const token = await getToken()
      if (!token) throw new Error('Not authenticated')
      const res = await api.getDecisions(token)
      setDecisions(res.decisions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history')
    }
  }

  async function handleOutcome(id: string, outcome: 'good' | 'bad' | 'neutral') {
    try {
      const token = await getToken()
      if (!token) return
      await api.updateOutcome(token, id, outcome)
      setDecisions(prev => prev?.map(d => d.id === id ? { ...d, outcome } : d) ?? null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update')
    }
  }

  return (
    <div className="app">
      <header>
        <div className="header-left">
          <h1>Stratum</h1>
          <nav>
            <button
              className={view === 'simulate' ? 'active' : ''}
              onClick={() => setView('simulate')}
            >
              Simulate
            </button>
            <button
              className={view === 'history' ? 'active' : ''}
              onClick={loadHistory}
            >
              History
            </button>
          </nav>
        </div>
        <UserButton />
      </header>

      <main>
        {error && <div className="error">{error}</div>}

        {view === 'simulate' && (
          <div className="simulate-view">
            <form onSubmit={handleSimulate} className="decision-form">
              <div className="field">
                <label>Decision</label>
                <input
                  type="text"
                  placeholder="What are you deciding?"
                  value={form.decision}
                  onChange={e => setForm(f => ({ ...f, decision: e.target.value }))}
                  required
                />
              </div>
              <div className="field">
                <label>Context</label>
                <textarea
                  placeholder="Relevant background, constraints, what you already know..."
                  value={form.context}
                  onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
                  rows={4}
                  required
                />
              </div>
              <div className="field">
                <label>Time Horizon</label>
                <select
                  value={form.horizon}
                  onChange={e => setForm(f => ({ ...f, horizon: e.target.value }))}
                >
                  {HORIZONS.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
              <button type="submit" disabled={loading} className="btn-primary">
                {loading ? 'Running simulation...' : 'Run Simulation'}
              </button>
            </form>

            {loading && (
              <div className="loading-state">
                <p>6 agents debating in parallel...</p>
                <p className="loading-sub">Optimist + Pessimist + Statistician + Devil's Advocate + Future Self + Opportunity Cost</p>
              </div>
            )}

            {result && <SimulationResultView result={result.result} />}
          </div>
        )}

        {view === 'history' && (
          <div className="history-view">
            {decisions === null ? (
              <p>Loading...</p>
            ) : decisions.length === 0 ? (
              <p className="empty">No decisions yet. Run your first simulation.</p>
            ) : (
              <div className="decision-list">
                {decisions.map(d => (
                  <DecisionCard key={d.id} decision={d} onOutcome={handleOutcome} />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function SimulationResultView({ result }: { result: SimulationResult }) {
  const [activeAgent, setActiveAgent] = useState<string | null>(null)
  const confidencePct = Math.round(result.confidence * 100)

  return (
    <div className="result">
      <div className="result-header">
        <div className="confidence">
          <span className="confidence-label">Confidence</span>
          <span className="confidence-value">{confidencePct}%</span>
        </div>
      </div>

      <div className="result-section">
        <h3>Summary</h3>
        <p>{result.summary}</p>
      </div>

      <div className="result-section highlight">
        <h3>Recommendation</h3>
        <p>{result.recommendation}</p>
      </div>

      {result.keyTension && (
        <div className="result-section">
          <h3>Core Tension</h3>
          <p>{result.keyTension}</p>
        </div>
      )}

      <div className="risks-opps">
        <div className="result-section">
          <h3>Top Risks</h3>
          <ul>{result.topRisks.map((r, i) => <li key={i}>{r}</li>)}</ul>
        </div>
        <div className="result-section">
          <h3>Top Opportunities</h3>
          <ul>{result.topOpportunities.map((o, i) => <li key={i}>{o}</li>)}</ul>
        </div>
      </div>

      <div className="result-section">
        <h3>Agent Analyses</h3>
        <div className="agent-tabs">
          {result.agents.map(agent => (
            <button
              key={agent.name}
              className={activeAgent === agent.name ? 'active' : ''}
              onClick={() => setActiveAgent(activeAgent === agent.name ? null : agent.name)}
            >
              {agent.name}
            </button>
          ))}
        </div>
        {activeAgent && (() => {
          const agent = result.agents.find(a => a.name === activeAgent)
          if (!agent) return null
          return (
            <div className="agent-detail">
              <p className="agent-role">{agent.perspective}</p>
              <p>{agent.analysis}</p>
              <ul>{agent.keyPoints.map((p, i) => <li key={i}>{p}</li>)}</ul>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

function DecisionCard({
  decision,
  onOutcome,
}: {
  decision: Decision
  onOutcome: (id: string, outcome: 'good' | 'bad' | 'neutral') => void
}) {
  const date = new Date(decision.created_at).toLocaleDateString()

  return (
    <div className="decision-card">
      <div className="decision-card-header">
        <span className="decision-text">{decision.decision}</span>
        <span className="decision-date">{date}</span>
      </div>
      <div className="decision-meta">
        <span className="horizon">{decision.horizon}</span>
        {decision.outcome && (
          <span className={`outcome outcome-${decision.outcome}`}>{decision.outcome}</span>
        )}
      </div>
      {!decision.outcome && (
        <div className="outcome-buttons">
          <span>How did it go?</span>
          {(['good', 'neutral', 'bad'] as const).map(o => (
            <button key={o} onClick={() => onOutcome(decision.id, o)} className={`outcome-btn outcome-${o}`}>
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
