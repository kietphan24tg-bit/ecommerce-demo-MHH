type RatingStarsProps = {
  rating: number
}

export function RatingStars({ rating }: RatingStarsProps) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating || 0)))

  return (
    <span className="font-mono text-xs tracking-[0.24em] text-amber-300">
      {'★'.repeat(safeRating)}
      <span className="text-white/15">{'★'.repeat(5 - safeRating)}</span>
    </span>
  )
}
