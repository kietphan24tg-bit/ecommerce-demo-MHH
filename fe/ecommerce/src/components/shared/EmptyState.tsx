import { SearchX } from 'lucide-react'

type EmptyStateProps = {
  title: string
  description: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex min-h-80 flex-col items-center justify-center rounded-[24px] border border-[#2d2314] bg-[#110d09] px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#1c160f] text-2xl font-bold text-[#f4ab22]">
        <SearchX className="h-7 w-7" strokeWidth={2.2} />
      </div>
      <h3 className="font-display text-2xl font-semibold text-[#f3ebdb]">{title}</h3>
      <p className="mt-3 max-w-md text-base leading-7 text-[#826944]">{description}</p>
    </div>
  )
}
