'use client'

import { useState } from 'react'
import type { SimulationResponse } from '@/types/simulation'
import ScenarioCards from './ScenarioCards'
import DebateTranscript from './DebateTranscript'
import SensitivityAnalysis from './SensitivityAnalysis'
import BaseRateAnchors from './BaseRateAnchors'

type Tab = 'overview' | 'debate' | 'scenarios' | 'sensitivity'

const TABS: { id: Tab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'debate', label: 'Debate' },
  { id: 'scenarios', label: 'Scenarios' },
  { id: 'sensitivity', label: 'Sensitivity' },
]

interface Props {
  result: SimulationResponse
}

export default function ResultsDashboard({ result }: Props) {
  const [tab, setTab] = useState<Tab>('overview')

  const topScenario = [...result.scenarios].sort((a, b) => b.probability - a.probability)[0]

  return (
    <div className="flex flex-col gap-6">
      {/* Meta row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#a0aec0]">
            {result.metadata.agents} agents · {result.metadata.rounds} rounds · {result.metadata.simulations} paths modeled
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#a0aec0]">Confidence</span>
          <span
            className={`text-xl font-bold ${
              result.confidence >= 70
                ? 'text-green-400'
                : result.confidence >= 50
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}
          >
            {result.confidence}%
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface2">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px ${
              tab === t.id
                ? 'border-blue-500 text-white'
                : 'border-transparent text-[#a0aec0] hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="flex flex-col gap-5">
          {/* Debate summary */}
          <div className="bg-surface rounded-xl border border-surface2 p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-3">
              Debate Summary
            </h3>
            <p className="text-white leading-relaxed">{result.debate_summary}</p>
          </div>

          {/* Top scenario */}
          {topScenario && (
            <div className="bg-surface rounded-xl border border-surface2 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-3">
                Most Likely Scenario
              </h3>
              <div className="flex items-start gap-4">
                <span className="text-4xl font-bold text-blue-400">{topScenario.probability}%</span>
                <div>
                  <p className="font-semibold text-white">{topScenario.name}</p>
                  <p className="text-sm text-[#a0aec0] mt-1">{topScenario.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key assumptions */}
          {result.key_assumptions?.length > 0 && (
            <div className="bg-surface rounded-xl border border-surface2 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-3">
                Critical Assumptions
              </h3>
              <ul className="flex flex-col gap-2">
                {result.key_assumptions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-white">
                    <span className="text-blue-400 mt-0.5">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Base rates */}
          {result.base_rates?.length > 0 && <BaseRateAnchors baseRates={result.base_rates} />}
        </div>
      )}

      {tab === 'debate' && (
        <DebateTranscript transcript={result.debate_transcript} />
      )}

      {tab === 'scenarios' && (
        <ScenarioCards scenarios={result.scenarios} />
      )}

      {tab === 'sensitivity' && (
        <SensitivityAnalysis
          items={result.sensitivity_analysis}
          assumptions={result.key_assumptions}
        />
      )}
    </div>
  )
}
