import { ChevronDown, SlidersHorizontal, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CATEGORY_LABELS,
  CATEGORIES,
  COST_STEP,
  MAX_COST,
  type CountryOption,
} from '../../data/market'
import type { ProductFilters as ProductFiltersType } from '../../types/product'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

type ProductFiltersProps = {
  filters: ProductFiltersType
  countryOptions: CountryOption[]
  resultCount: number
  mobileOpen?: boolean
  onChange: <K extends keyof ProductFiltersType>(
    key: K,
    value: ProductFiltersType[K],
  ) => void
  onReset: () => void
  onMobileClose?: () => void
}

type FilterOption = {
  value: string
  label: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

const normalizeText = (value: string) => value.trim().toLowerCase()

function FilterDropdown({
  value,
  options,
  searchPlaceholder,
  onChange,
}: {
  value: string
  options: FilterOption[]
  searchPlaceholder: string
  onChange: (value: string) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [typing, setTyping] = useState(false)
  const [inputValue, setInputValue] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [openUpward, setOpenUpward] = useState(false)

  const selectedOption = options.find((option) => option.value === value) ?? options[0]

  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalizeText(searchTerm)

    if (!normalizedQuery) {
      return options
    }

    return options.filter((option) => {
      return (
        normalizeText(option.label).includes(normalizedQuery) ||
        normalizeText(option.value).includes(normalizedQuery)
      )
    })
  }, [options, searchTerm])

  useEffect(() => {
    if (!open || !typing) {
      return
    }

    inputRef.current?.focus()
  }, [open, typing])

  useEffect(() => {
    if (!open) {
      return
    }

    const updatePlacement = () => {
      if (!containerRef.current || !menuRef.current) {
        return
      }

      const containerRect = containerRef.current.getBoundingClientRect()
      const menuHeight = menuRef.current.offsetHeight
      const gap = 0
      const viewportPadding = 12
      const spaceBelow = window.innerHeight - containerRect.bottom - viewportPadding
      const spaceAbove = containerRect.top - viewportPadding

      setOpenUpward(spaceBelow < menuHeight + gap && spaceAbove > spaceBelow)
    }

    updatePlacement()
    window.addEventListener('resize', updatePlacement)
    window.addEventListener('scroll', updatePlacement, true)

    return () => {
      window.removeEventListener('resize', updatePlacement)
      window.removeEventListener('scroll', updatePlacement, true)
    }
  }, [open, filteredOptions.length])

  useEffect(() => {
    if (!open) {
      return
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        handleClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    return () => document.removeEventListener('mousedown', handlePointerDown)
  }, [open])

  const handleOpen = (enableTyping = false) => {
    setOpen(true)
    setTyping(enableTyping)
    setInputValue(selectedOption?.label ?? '')
    setSearchTerm('')
  }

  const handleClose = () => {
    setOpen(false)
    setTyping(false)
    setInputValue('')
    setSearchTerm('')
    setOpenUpward(false)
  }

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    handleClose()
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          value={open ? inputValue : selectedOption?.label ?? ''}
          readOnly={!typing}
          placeholder={typing ? searchPlaceholder : undefined}
          onClick={() => {
            if (!open) {
              handleOpen(false)
              return
            }

            if (!typing) {
              setTyping(true)
              setInputValue(selectedOption?.label ?? '')
              setSearchTerm('')
            }
          }}
          onChange={(event) => {
            if (!typing) {
              return
            }

            setInputValue(event.target.value)
            setSearchTerm(event.target.value)
          }}
          onKeyDown={(event) => {
            if ((event.key === 'Enter' || event.key === 'ArrowDown') && !open) {
              event.preventDefault()
              handleOpen(false)
              return
            }

            if (event.key === 'Escape') {
              handleClose()
              return
            }

            if (event.key === 'Enter' && !typing) {
              event.preventDefault()
              setTyping(true)
              setInputValue(selectedOption?.label ?? '')
              setSearchTerm('')
              return
            }

            if (event.key === 'Enter' && filteredOptions[0]) {
              event.preventDefault()
              handleSelect(filteredOptions[0].value)
            }
          }}
          className={`h-10.5 rounded-[8px] border-[#3c3429] bg-[#17120d] px-4 pr-11 text-[0.98rem] font-semibold text-[#f3ead6] placeholder:text-[#7e6950] transition hover:border-[#6e5324] focus:border-[#6e5324] ${
            typing ? 'cursor-text' : 'cursor-pointer'
          }`}
        />

        <ChevronDown
          className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8d6930] transition ${open ? 'rotate-180' : ''}`}
        />
      </div>

      {open ? (
        <div
          ref={menuRef}
          className={`absolute left-0 right-0 z-30 overflow-hidden rounded-[10px] border border-[#4a3922] bg-[#120d09] shadow-[0_18px_40px_rgba(0,0,0,0.45)] ${
            openUpward ? 'bottom-full' : 'top-full'
          }`}
        >
          <div className="scrollbar-panel max-h-56 overflow-y-auto py-1">
            {filteredOptions.length === 0 ? (
              <p className="px-4 py-3 text-sm text-[#8f7a5a]">Không có gợi ý phù hợp</p>
            ) : (
              filteredOptions.map((option) => {
                const isActive = option.value === value

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition ${
                      isActive
                        ? 'bg-[#2b1d0e] font-semibold text-[#f4c160]'
                        : 'text-[#eadfcb] hover:bg-[#1b140d]'
                    }`}
                  >
                    {option.label}
                  </button>
                )
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function ProductFilters({
  filters,
  countryOptions,
  resultCount,
  mobileOpen = false,
  onChange,
  onReset,
  onMobileClose,
}: ProductFiltersProps) {
  const categoryOptions = CATEGORIES.map((category) => ({
    value: category,
    label: CATEGORY_LABELS[category] ?? category,
  }))

  const ratingOptions = [
    { value: '', label: 'Tất cả' },
    ...[1, 2, 3, 4, 5].map((rating) => ({
      value: String(rating),
      label: `${rating} sao`,
    })),
  ]

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      ) : null}

      <aside
        className={[
          'border-r border-[#241c11] bg-[#0b0806]',
          'fixed inset-y-0 left-0 z-50 w-[300px] overflow-y-auto transition-transform duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:relative lg:inset-y-auto lg:left-auto lg:z-auto lg:w-auto lg:translate-x-0 lg:overflow-visible',
          'lg:sticky lg:top-[69px] lg:h-[calc(100svh-69px)]',
        ].join(' ')}
      >
      <div className="border-b border-[#241c11] px-5 py-5 xl:px-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-[#d3a03a]">
            <SlidersHorizontal className="h-4.5 w-4.5" />
            <h2 className="font-sans text-[0.95rem] font-semibold uppercase leading-none tracking-[0.24em] text-[#d7b06a]">
              Bộ lọc
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="rounded-full border border-[#4b3513] bg-[#1b1207] px-3 py-1 text-[0.9rem] font-semibold text-[#cf9d2b]">
              {resultCount} kết quả
            </div>
            <button
              type="button"
              onClick={onMobileClose}
              aria-label="Đóng bộ lọc"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#241c11] text-[#8d6930] transition hover:text-[#f4ead4] lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-7 px-5 py-6 xl:px-6">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-[#c89220]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d6930]">
              Xuất xứ
            </p>
          </div>
          <FilterDropdown
            value={filters.country}
            options={countryOptions}
            searchPlaceholder="Tìm xuất xứ"
            onChange={(nextValue) => onChange('country', nextValue)}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-[#c89220]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d6930]">
              Danh mục
            </p>
          </div>
          <FilterDropdown
            value={filters.category}
            options={categoryOptions}
            searchPlaceholder="Tìm danh mục"
            onChange={(nextValue) => onChange('category', nextValue)}
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-[#c89220]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d6930]">
              Giá tối thiểu
            </p>
          </div>

          <div className="mb-4 flex items-center justify-between text-[0.95rem] font-medium text-[#f4ab22]">
            <span>Từ {formatCurrency(filters.costMin)}</span>
            <span>{formatCurrency(MAX_COST)}+</span>
          </div>

          <input
            type="range"
            min={0}
            max={MAX_COST}
            step={COST_STEP}
            value={filters.costMin}
            onChange={(event) => onChange('costMin', Number(event.target.value))}
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-[#2e261c] accent-[#f4ab22]"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-7 bg-[#c89220]" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#8d6930]">
              Đánh giá tối thiểu
            </p>
          </div>
          <FilterDropdown
            value={filters.rating}
            options={ratingOptions}
            searchPlaceholder="Tìm mức đánh giá"
            onChange={(nextValue) => onChange('rating', nextValue)}
          />
        </div>

        <Button
          variant="secondary"
          className="h-11 w-full rounded-[10px] border-[#4d4337] bg-transparent text-[0.98rem] font-semibold text-[#f4ead4] hover:border-[#8b6a31] hover:bg-[#15100b]"
          onClick={onReset}
        >
          Xóa bộ lọc
        </Button>
      </div>
    </aside>
    </>
  )
}
