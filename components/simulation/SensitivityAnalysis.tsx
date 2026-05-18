import type { SensitivityItem } from '@/types/simulation'

interface Props {
  items: SensitivityItem[]
  assumptions: string[]
}

export default function SensitivityAnalysis({ items, assumptions }: Props) {
  if (!items?.length && !assumptions?.length) {
    return (
      <div className="bg-surface rounded-xl border border-surface2 p-8 text-center text-[#a0aec0]">
        No sensitivity analysis available for this simulation.
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {items?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-4">
            How Key Assumptions Swing Outcomes
          </h3>
          <div className="bg-surface rounded-xl border border-surface2 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface2">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#a0aec0] w-1/3">
                    Assumption
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-green-400 w-1/3">
                    If True
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-red-400 w-1/3">
                    If False
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className={i % 2 === 0 ? 'bg-surface' : 'bg-[#0a0e27]'}>
                    <td className="px-5 py-4 text-white font-medium align-top">{item.assumption}</td>
                    <td className="px-5 py-4 text-green-300 align-top">{item.if_true}</td>
                    <td className="px-5 py-4 text-red-300 align-top">{item.if_false}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {assumptions?.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[#a0aec0] mb-4">
            Critical Unknowns
          </h3>
          <div className="bg-surface rounded-xl border border-surface2 p-5">
            <ul className="flex flex-col gap-3">
              {assumptions.map((a, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-blue-400 text-xs font-mono mt-0.5 flex-shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-white text-sm">{a}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
