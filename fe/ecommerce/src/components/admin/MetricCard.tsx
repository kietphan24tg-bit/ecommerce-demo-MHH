import type { LucideIcon } from 'lucide-react'

type MetricCardProps = {
  label: string
  value: string
  hint: string
  icon: LucideIcon
}

export function MetricCard({ label, value, hint, icon: Icon }: MetricCardProps) {
  return (
    <section className="surface-soft p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="meta-label">{label}</p>
          <p className="accent-text mt-3 font-display text-3xl font-bold">
            {value}
          </p>
          <p className="mt-2 text-sm text-slate-400">{hint}</p>
        </div>
        <div className="rounded-2xl border border-orange-400/15 bg-orange-400/8 p-3 text-orange-300">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </section>
  )
}
