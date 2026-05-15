import type { PropsWithChildren, ReactNode } from 'react'

export const adminPalette = {
  bg: '#0e0c0a',
  sidebar: '#111009',
  surface: '#1a1714',
  surface2: '#201d19',
  border: '#2e2a24',
  borderLight: '#3a3530',
  orange: '#f7931a',
  gold: '#c8a84b',
  muted: '#7a7570',
  text: '#f0ece6',
  success: '#22c55e',
  danger: '#ef4444',
}

export function formatAdminCurrency(value?: number | null) {
  if (typeof value !== 'number') {
    return '—'
  }

  return `${value.toLocaleString('vi-VN')} đ`
}

export function slugifyAdminValue(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
}

export function createAdminProductId() {
  return `prd-${Date.now().toString(36)}`
}

export function getStatusTone(status: 'active' | 'inactive' | 'draft') {
  if (status === 'active') {
    return 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
  }

  return 'border border-stone-500/30 bg-stone-500/10 text-[#b8afa4]'
}

export function AdminBadge({ status }: { status: 'active' | 'inactive' | 'draft' }) {
  const label = status === 'active' ? 'Active' : status === 'draft' ? 'Draft' : 'Inactive'

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${getStatusTone(status)}`}
    >
      {label}
    </span>
  )
}

export function AdminPanel({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) {
  return (
    <section className={`rounded-[24px] border border-[#2e2a24] bg-[#1a1714] ${className}`}>
      {children}
    </section>
  )
}

export function AdminField({
  label,
  children,
}: PropsWithChildren<{ label: string }>) {
  return (
    <label className="mb-4 block">
      <span className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7a7570]">
        {label}
      </span>
      {children}
    </label>
  )
}

export function AdminInput({
  as = 'input',
  className = '',
  ...props
}: {
  as?: 'input' | 'textarea' | 'select'
  className?: string
} & Record<string, unknown>) {
  const sharedClassName =
    'w-full rounded-[10px] border border-[#3a3530] bg-[#111] px-3 py-[10px] text-sm text-[#f0ece6] outline-none transition placeholder:text-[#5f5a55] focus:border-[#7a5623]'

  if (as === 'textarea') {
    return (
      <textarea className={`${sharedClassName} min-h-[88px] resize-y ${className}`} {...props} />
    )
  }

  if (as === 'select') {
    return <select className={`${sharedClassName} cursor-pointer ${className}`} {...props} />
  }

  return <input className={`${sharedClassName} ${className}`} {...props} />
}

export function AdminDrawer({
  title,
  onClose,
  onSave,
  saveLabel = 'Lưu',
  children,
}: PropsWithChildren<{
  title: string
  onClose: () => void
  onSave: () => void
  saveLabel?: string
}>) {
  return (
    <aside className="flex h-full w-[340px] shrink-0 flex-col border-l border-[#2e2a24] bg-[#1a1714]">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#2e2a24] bg-[#1a1714] px-5 py-4">
        <h2 className="font-display text-lg font-bold text-white">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-[#7a7570] transition hover:bg-white/[0.04] hover:text-white"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>

      <div className="sticky bottom-0 z-10 flex gap-3 border-t border-[#2e2a24] bg-[#1a1714] px-5 py-4 shadow-[0_-14px_30px_rgba(14,12,10,0.42)]">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-[10px] border border-[#3a3530] px-4 py-2.5 text-sm text-[#7a7570] transition hover:text-white"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={onSave}
          className="flex-[1.6] rounded-[10px] bg-gradient-to-r from-[#ea580c] to-[#f7931a] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_0_18px_-8px_rgba(247,147,26,0.7)]"
        >
          {saveLabel}
        </button>
      </div>
    </aside>
  )
}

export function AdminToolbar({
  children,
  right,
}: {
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-[#2e2a24] bg-[#1a1714]/70 px-7 py-4 backdrop-blur">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">{children}</div>
      {right ? <div className="flex items-center gap-3">{right}</div> : null}
    </div>
  )
}
