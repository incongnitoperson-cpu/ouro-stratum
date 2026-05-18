import { UserButton } from '@clerk/nextjs'

const TIERS = [
  { label: 'Personal', active: true },
  { label: 'Corporate', active: false },
  { label: 'Government', active: false },
]

export default function StratumLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-navy">
      <header className="border-b border-surface2 bg-navy/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-lg tracking-tight text-white">Stratum</span>
            <div className="flex items-center gap-1">
              {TIERS.map(t => (
                <span
                  key={t.label}
                  className={`text-xs font-semibold uppercase tracking-wide px-3 py-1 rounded-full transition-all ${
                    t.active
                      ? 'bg-blue-600 text-white'
                      : 'text-[#a0aec0] opacity-40 cursor-not-allowed'
                  }`}
                  title={t.active ? undefined : 'Coming soon'}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>
          <UserButton afterSignOutUrl="/" />
        </div>
      </header>
      <main className="max-w-[1400px] mx-auto px-6 py-8">{children}</main>
    </div>
  )
}
