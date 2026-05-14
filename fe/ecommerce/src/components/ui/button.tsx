import type { ButtonHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
}

const variants: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:
    'bg-gradient-to-r from-orange-600 to-amber-400 text-white shadow-[0_16px_30px_-16px_rgba(247,147,26,0.95)] hover:scale-[1.01]',
  secondary:
    'border border-white/12 bg-white/6 text-white hover:border-amber-400/50 hover:bg-white/10',
  danger:
    'bg-gradient-to-r from-red-900 to-red-500 text-white shadow-[0_16px_30px_-18px_rgba(239,68,68,0.9)] hover:scale-[1.01]',
  ghost:
    'border border-transparent bg-transparent text-slate-300 hover:bg-white/6 hover:text-white',
}

export function Button({
  className,
  variant = 'primary',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
