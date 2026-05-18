import type { BaseRate } from '@/types/simulation'

interface Props {
  baseRates: BaseRate[]
}

export default function BaseRateAnchors({ baseRates }: Props) {
  if (!baseRates?.length) return null

  return (
    <div className="bg-surface rounded-xl border border-surface2 p-5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-4">
        Historical Base Rates
      </h3>
      <ul className="flex flex-col gap-3">
        {baseRates.map((r, i) => (
          <li key={i} className="flex items-start gap-4">
            <span className="text-2xl font-bold text-indigo-400 tabular-nums flex-shrink-0 w-12">
              {r.historical_rate}
            </span>
            <div>
              <p className="text-sm text-white">{r.context}</p>
              <p className="text-xs text-[#a0aec0] mt-0.5">{r.source}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
