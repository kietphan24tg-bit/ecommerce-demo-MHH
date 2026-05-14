type SectionEyebrowProps = {
  children: string
}

export function SectionEyebrow({ children }: SectionEyebrowProps) {
  return (
    <div className="meta-label mb-3 flex items-center gap-3">
      <span className="h-px w-8 bg-gradient-to-r from-orange-500 to-yellow-300" />
      <span>{children}</span>
    </div>
  )
}
