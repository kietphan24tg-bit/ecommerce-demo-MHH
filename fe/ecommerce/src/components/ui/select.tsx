import type { SelectHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export function Select({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'field appearance-none pr-10 text-sm text-white',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}
