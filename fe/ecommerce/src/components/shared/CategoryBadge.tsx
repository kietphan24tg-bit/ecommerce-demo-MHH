import { CATEGORY_COLORS, CATEGORY_LABELS } from '../../data/market'
import { cn } from '../../lib/utils'

type CategoryBadgeProps = {
  category: string
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full border px-3 py-1 font-sans text-[10px] font-semibold uppercase tracking-[0.16em]',
        CATEGORY_COLORS[category] ?? CATEGORY_COLORS.All,
      )}
    >
      {CATEGORY_LABELS[category] ?? category}
    </span>
  )
}
