type RatingStarsProps = {
  rating: number
}

export function RatingStars({ rating }: RatingStarsProps) {
  return (
    <span className="font-mono text-xs tracking-[0.24em] text-amber-300">
      {'★'.repeat(rating)}
      <span className="text-white/15">{'★'.repeat(5 - rating)}</span>
    </span>
  )
}
