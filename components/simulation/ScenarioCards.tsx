'use client'

import { useState } from 'react'
import type { Scenario } from '@/types/simulation'

function probabilityColor(p: number): string {
  if (p >= 60) return 'text-green-400 border-green-500/30 bg-green-500/5'
  if (p >= 35) return 'text-blue-400 border-blue-500/30 bg-blue-500/5'
  return 'text-amber-400 border-amber-500/30 bg-amber-500/5'
}

function probabilityBarColor(p: number): string {
  if (p >= 60) return 'bg-green-500'
  if (p >= 35) return 'bg-blue-500'
  return 'bg-amber-500'
}

interface Props {
  scenarios: Scenario[]
}

export default function ScenarioCards({ scenarios }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const sorted = [...scenarios].sort((a, b) => b.probability - a.probability)

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-[#a0aec0]">
        Probability-weighted outcomes synthesized from all 3 debate rounds.
      </p>
      {sorted.map(s => {
        const isOpen = expanded === s.name
        const colors = probabilityColor(s.probability)

        return (
          <div
            key={s.name}
            className={`bg-surface rounded-xl border transition-all duration-200 ${colors}`}
          >
            <button
              className="w-full text-left p-5"
              onClick={() => setExpanded(isOpen ? null : s.name)}
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <span className={`text-3xl font-bold tabular-nums ${colors.split(' ')[0]}`}>
                    {s.probability}%
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white text-base">{s.name}</p>
                    <p className="text-sm text-[#a0aec0] mt-0.5 truncate">{s.description}</p>
                  </div>
                </div>
                <span className="text-[#a0aec0] text-sm flex-shrink-0">{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Probability bar */}
              <div className="mt-3 h-1 bg-surface2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${probabilityBarColor(s.probability)}`}
                  style={{ width: `${s.probability}%` }}
                />
              </div>
            </button>

            {isOpen && (
              <div className="px-5 pb-5 flex flex-col gap-4 border-t border-surface2 pt-4">
                <p className="text-sm text-white leading-relaxed">{s.description}</p>

                {s.key_drivers?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
                      What needs to happen
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {s.key_drivers.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white">
                          <span className="text-green-400 mt-0.5">✓</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.risks?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-2">
                      What could derail it
                    </p>
                    <ul className="flex flex-col gap-1.5">
                      {s.risks.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-white">
                          <span className="text-red-400 mt-0.5">✗</span> {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {s.supporting_agents?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-[#a0aec0] self-center">Supported by:</span>
                    {s.supporting_agents.map(a => (
                      <span key={a} className="text-xs bg-surface2 text-[#a0aec0] px-2 py-1 rounded-full">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
