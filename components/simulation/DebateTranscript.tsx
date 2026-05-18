'use client'

import { useState } from 'react'
import type { AgentResponse } from '@/types/simulation'

const AGENT_STYLES: Record<string, { color: string; bg: string; dot: string }> = {
  base_rates: { color: 'text-indigo-400', bg: 'border-indigo-500/30', dot: 'bg-indigo-500' },
  optimist: { color: 'text-green-400', bg: 'border-green-500/30', dot: 'bg-green-500' },
  pessimist: { color: 'text-amber-400', bg: 'border-amber-500/30', dot: 'bg-amber-500' },
  contrarian: { color: 'text-purple-400', bg: 'border-purple-500/30', dot: 'bg-purple-500' },
  expert: { color: 'text-cyan-400', bg: 'border-cyan-500/30', dot: 'bg-cyan-500' },
}

function AgentCard({ response, defaultOpen = false }: { response: AgentResponse; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  const style = AGENT_STYLES[response.agent] ?? AGENT_STYLES.expert!
  const preview = response.message.slice(0, 120) + (response.message.length > 120 ? '...' : '')

  return (
    <div className={`bg-surface rounded-xl border ${style.bg} transition-all`}>
      <button
        className="w-full text-left p-4"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${style.dot}`} />
            <span className={`text-sm font-semibold uppercase tracking-wide ${style.color}`}>
              {response.agent_name}
            </span>
          </div>
          <span className="text-[#a0aec0] text-xs">{open ? '▲' : '▼'}</span>
        </div>
        {!open && (
          <p className="text-xs text-[#a0aec0] mt-2 pl-5 leading-relaxed">{preview}</p>
        )}
      </button>

      {open && (
        <div className="px-4 pb-4 pt-0 pl-9 border-t border-surface2">
          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap mt-3">
            {response.message}
          </p>
        </div>
      )}
    </div>
  )
}

interface Props {
  transcript: {
    round1: AgentResponse[]
    round2: AgentResponse[]
    round3: AgentResponse[]
  }
}

const ROUND_DESCRIPTIONS = [
  'Initial independent analyses — no agent has seen the others yet.',
  'Rebuttals — each agent responds to the others. Watch for "I agree/disagree with..."',
  'Final positions — probability estimates locked in, key insights surfaced.',
]

export default function DebateTranscript({ transcript }: Props) {
  const [activeRound, setActiveRound] = useState<1 | 2 | 3>(1)

  const rounds: { id: 1 | 2 | 3; label: string; responses: AgentResponse[] }[] = [
    { id: 1, label: 'Round 1', responses: transcript.round1 },
    { id: 2, label: 'Round 2', responses: transcript.round2 },
    { id: 3, label: 'Round 3', responses: transcript.round3 },
  ]

  const active = rounds.find(r => r.id === activeRound)!

  return (
    <div className="flex flex-col gap-4">
      {/* Round tabs */}
      <div className="flex gap-2">
        {rounds.map(r => (
          <button
            key={r.id}
            onClick={() => setActiveRound(r.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeRound === r.id
                ? 'bg-blue-600 text-white'
                : 'bg-surface2 text-[#a0aec0] hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      <p className="text-xs text-[#a0aec0] italic">{ROUND_DESCRIPTIONS[activeRound - 1]}</p>

      <div className="flex flex-col gap-3">
        {active.responses.map((r, i) => (
          <AgentCard key={r.agent} response={r} defaultOpen={i === 0 && activeRound === 1} />
        ))}
      </div>
    </div>
  )
}
