import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '../../lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full appearance-none rounded-xl border border-[#2d2314] bg-[#17120d] px-4 py-3 text-sm text-[#f4ead4] outline-none transition focus:border-[#7c6029] focus:bg-[#1d1711]',
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'
