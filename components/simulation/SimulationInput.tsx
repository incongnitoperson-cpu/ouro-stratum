'use client'

import { useState } from 'react'
import type { SimulationInput } from '@/types/simulation'

const TIMELINES = [
  { value: '6mo', label: '6 months' },
  { value: '1yr', label: '1 year' },
  { value: '3yr', label: '3 years' },
  { value: '5yr', label: '5 years' },
] as const

interface Props {
  onSubmit: (input: SimulationInput) => void
  loading: boolean
}

export default function SimulationInput({ onSubmit, loading }: Props) {
  const [decision, setDecision] = useState('')
  const [age, setAge] = useState('')
  const [timeline, setTimeline] = useState<'6mo' | '1yr' | '3yr' | '5yr'>('1yr')
  const [notes, setNotes] = useState('')
  const [showContext, setShowContext] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!decision.trim()) return
    onSubmit({
      decision: decision.trim(),
      context: {
        age: age.trim() || undefined,
        timeline,
        notes: notes.trim() || undefined,
      },
      tier: 'personal',
    })
  }

  const charCount = decision.length
  const charMax = 500

  return (
    <div className="bg-surface rounded-xl border border-surface2 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-bold text-white">Simulate a Decision</h2>
        <p className="text-sm text-[#a0aec0] mt-1">
          5 agents debate for 3 rounds. You get probability-weighted scenarios, not opinions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Tier selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
            Tier
          </label>
          <div className="flex gap-2">
            {(['Personal', 'Corporate', 'Government'] as const).map((t, i) => (
              <button
                key={t}
                type="button"
                disabled={i > 0}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide transition-all ${
                  i === 0
                    ? 'bg-blue-600 text-white'
                    : 'bg-surface2 text-[#a0aec0] opacity-40 cursor-not-allowed'
                }`}
                title={i > 0 ? 'Coming soon' : undefined}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Decision textarea */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
            Decision
          </label>
          <textarea
            value={decision}
            onChange={e => setDecision(e.target.value.slice(0, charMax))}
            rows={4}
            placeholder="Should I quit my job to build my startup full-time?"
            required
            className="w-full bg-[#0a0e27] border border-surface2 rounded-lg px-4 py-3 text-white text-sm placeholder:text-[#a0aec0]/40 focus:outline-none focus:border-blue-500 transition-colors resize-none"
          />
          <p className="text-right text-xs text-[#a0aec0]/40 mt-1">
            {charCount}/{charMax}
          </p>
        </div>

        {/* Optional context toggle */}
        <button
          type="button"
          onClick={() => setShowContext(v => !v)}
          className="flex items-center gap-2 text-xs text-[#a0aec0] hover:text-white transition-colors"
        >
          <span>{showContext ? '▼' : '▶'}</span>
          Add context (optional)
        </button>

        {showContext && (
          <div className="flex flex-col gap-4 pl-4 border-l border-surface2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
                Age / Stage
              </label>
              <input
                type="text"
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="e.g. 28, senior engineer, 3 years savings"
                className="w-full bg-[#0a0e27] border border-surface2 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#a0aec0]/40 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
                Time Horizon
              </label>
              <div className="flex gap-2 flex-wrap">
                {TIMELINES.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTimeline(t.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      timeline === t.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-surface2 text-[#a0aec0] hover:text-white'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
                Additional Context
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Current salary, savings runway, market conditions, personal constraints..."
                className="w-full bg-[#0a0e27] border border-surface2 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-[#a0aec0]/40 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !decision.trim()}
          className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 text-sm"
        >
          {loading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-surface2 grid grid-cols-3 gap-3 text-center">
        {[['5', 'Agents'], ['3', 'Rounds'], ['1', 'Synthesis']].map(([n, l]) => (
          <div key={l}>
            <p className="text-xl font-bold text-blue-400">{n}</p>
            <p className="text-xs text-[#a0aec0]">{l}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
