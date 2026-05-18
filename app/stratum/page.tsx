'use client'

import { useState } from 'react'
import SimulationInput from '@/components/simulation/SimulationInput'
import ResultsDashboard from '@/components/simulation/ResultsDashboard'
import type { SimulationInput as Input, SimulationResponse } from '@/types/simulation'

const LOADING_STAGES = [
  'Gathering historical base rates...',
  'Round 1: 5 agents analyzing in parallel...',
  'Round 2: Agents debating each other...',
  'Round 3: Locking in final positions...',
  'Synthesizing probability-weighted scenarios...',
]

export default function StratumPage() {
  const [loading, setLoading] = useState(false)
  const [stageIdx, setStageIdx] = useState(0)
  const [result, setResult] = useState<SimulationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSimulate(input: Input) {
    setLoading(true)
    setError(null)
    setResult(null)
    setStageIdx(0)

    // Animate through stages while waiting
    const stageDurations = [2000, 12000, 10000, 8000, 6000]
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []
    for (let i = 1; i < LOADING_STAGES.length; i++) {
      elapsed += stageDurations[i - 1] ?? 2000
      timers.push(setTimeout(() => setStageIdx(i), elapsed))
    }

    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      timers.forEach(clearTimeout)

      if (!res.ok) {
        const err = (await res.json()) as { error: string }
        throw new Error(err.error ?? 'Simulation failed')
      }

      const data = (await res.json()) as SimulationResponse
      setResult(data)
    } catch (err) {
      timers.forEach(clearTimeout)
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-8 items-start">
      {/* Left: Input */}
      <div className="lg:sticky lg:top-24">
        <SimulationInput onSubmit={handleSimulate} loading={loading} />
      </div>

      {/* Right: Results */}
      <div className="min-h-[400px]">
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-white mb-2">Running 1M+ simulations...</p>
              <p className="text-[#a0aec0] text-sm font-mono">{LOADING_STAGES[stageIdx]}</p>
            </div>
            <div className="flex gap-2">
              {LOADING_STAGES.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                    i <= stageIdx ? 'bg-blue-500' : 'bg-surface2'
                  }`}
                />
              ))}
            </div>
            <div className="grid grid-cols-5 gap-3 mt-2">
              {['Statistician', 'Bull Case', 'Risk Analyst', "Devil's Advocate", 'Domain Specialist'].map(
                (name, i) => (
                  <div key={name} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-8 h-8 rounded-full animate-pulse-slow ${
                        ['bg-statistician', 'bg-optimist', 'bg-pessimist', 'bg-contrarian', 'bg-expert'][i]
                      }`}
                    />
                    <span className="text-[10px] text-[#a0aec0] text-center leading-tight">{name}</span>
                  </div>
                )
              )}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && !result && (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
            <p className="text-[#a0aec0]">Run a simulation to see probability-weighted scenarios.</p>
            <p className="text-sm text-[#a0aec0]/50">
              5 agents debate your decision across 3 rounds, then a synthesis agent weighs the arguments.
            </p>
          </div>
        )}

        {result && <ResultsDashboard result={result} />}
      </div>
    </div>
  )
}
