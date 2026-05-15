import { ChevronLeft, ChevronRight, Grid2X2, Heart, List, ShoppingBag, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { RatingStars } from '../../components/shared/RatingStars'
import {
  CATEGORY_LABELS,
  COUNTRY_LABELS,
  createProductImage,
  PRODUCT_COPY,
} from '../../data/market'
import { cn } from '../../lib/utils'
import { useMarketStore } from '../../store/useMarketStore'
import type { SavedItem } from '../../types/product'

type ViewMode = 'grid' | 'list'
type SortMode = 'latest' | 'price-desc' | 'price-asc' | 'rating'
type PaginationItem = number | '...'

const SAVED_ITEMS_PER_PAGE = 6

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildPagination(currentPage: number, totalPages: number): PaginationItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages]
  }

  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
}

function SavedProductMedia({ item }: { item: SavedItem }) {
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="relative h-full overflow-hidden bg-[#0d0d0d]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,167,35,0.14),transparent_38%)]" />
      <img
        src={imageFailed ? createProductImage(item.category) : item.image}
        alt={item.name}
        className="h-full w-full object-cover object-center opacity-90"
        referrerPolicy="no-referrer"
        onError={() => setImageFailed(true)}
      />
    </div>
  )
}

function SavedGridCard({
  item,
  onAddToCart,
  onRemove,
}: {
  item: SavedItem
  onAddToCart: () => void
  onRemove: () => void
}) {
  const localized = PRODUCT_COPY[item.productId]
  const displayName = localized?.name ?? item.name

  return (
    <article className="group overflow-hidden rounded-[26px] border border-[#302519] bg-[#17110d] shadow-[0_18px_40px_rgba(0,0,0,0.16)] transition hover:-translate-y-1 hover:border-[#6a4a1b]">
      <div className="relative h-[284px] border-b border-[#2f2418]">
        <SavedProductMedia item={item} />
        <p className="absolute bottom-4 left-4 text-[0.92rem] italic text-[#b1a087]">
          {item.savedAtLabel}
        </p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Bỏ lưu ${displayName}`}
          className="absolute bottom-4 right-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#62431a] bg-[#2a1b09] text-[#f4a11b] transition hover:border-[#f4a11b] hover:scale-105"
        >
          <Heart className="h-5 w-5 fill-current" />
        </button>
      </div>

      <div className="space-y-4 px-5 pb-5 pt-4">
        <div>
          <p className="text-[0.76rem] uppercase tracking-[0.32em] text-[#8e7d66]">
            {CATEGORY_LABELS[item.category] ?? item.category}
          </p>
          <h3 className="mt-2 text-[1.05rem] font-bold leading-[1.35] text-[#f7f1e9]">
            {displayName}
          </h3>
          <div className="mt-2 flex items-center gap-2 text-[0.95rem] text-[#ae9d84]">
            <RatingStars rating={item.rating} />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {item.colors.slice(0, 4).map((color) => (
            <span
              key={`${item.id}-${color.hex}`}
              className="h-4 w-4 rounded-full border border-white/15"
              style={{ backgroundColor: color.hex }}
              title={color.name}
            />
          ))}
        </div>

        <div className="flex items-end gap-3">
          <span className="font-display text-[1.15rem] font-bold text-[#ff9c18]">
            {formatCurrency(item.price)}
          </span>
          {item.originalPrice ? (
            <span className="text-[0.96rem] text-[#7f7265] line-through">
              {formatCurrency(item.originalPrice)}
            </span>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={!item.inStock}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[14px] border border-[#433223] bg-[#1a140f] text-[0.98rem] font-bold text-[#faf3e6] transition hover:border-[#8d6830] hover:text-[#ffcb63] disabled:cursor-not-allowed disabled:border-[#30271d] disabled:text-[#6d6359]"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          {item.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
        </button>
      </div>
    </article>
  )
}

function SavedListRow({
  item,
  onAddToCart,
  onRemove,
}: {
  item: SavedItem
  onAddToCart: () => void
  onRemove: () => void
}) {
  const localized = PRODUCT_COPY[item.productId]
  const displayName = localized?.name ?? item.name

  return (
    <article className="grid gap-5 border-b border-[#30261c] px-6 py-6 last:border-b-0 lg:grid-cols-[112px_minmax(0,1fr)_180px] lg:items-center">
      <div className="overflow-hidden rounded-[18px] border border-[#2d2318] bg-[#0f0f10]">
        <div className="h-[116px]">
          <SavedProductMedia item={item} />
        </div>
      </div>

      <div className="min-w-0">
        <p className="text-[0.78rem] uppercase tracking-[0.34em] text-[#8e7d66]">
          {(CATEGORY_LABELS[item.category] ?? item.category).toUpperCase()} ·{' '}
          {(COUNTRY_LABELS[item.country] ?? item.country).toUpperCase()}
        </p>
        <h3 className="mt-2 text-[1.05rem] font-bold leading-[1.35] text-[#f7f1e9]">
          {displayName}
        </h3>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-[0.95rem] text-[#ae9d84]">
          <RatingStars rating={item.rating} />
          <span>{item.rating.toFixed(1)}</span>
        </div>
        <p className="mt-2 text-[0.94rem] italic text-[#988872]">{item.savedAtLabel}</p>
      </div>

      <div className="flex flex-col gap-3 lg:items-end">
        <div className="text-left lg:text-right">
          <p className="font-display text-[1.2rem] font-bold text-[#ff9c18]">
            {formatCurrency(item.price)}
          </p>
          {item.originalPrice ? (
            <p className="text-[0.96rem] text-[#7f7265] line-through">
              {formatCurrency(item.originalPrice)}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onAddToCart}
          disabled={!item.inStock}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#433223] px-4 font-bold text-[#faf3e6] transition hover:border-[#8d6830] hover:text-[#ffcb63] disabled:cursor-not-allowed disabled:border-[#30271d] disabled:text-[#6d6359] lg:w-[160px]"
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          Vào giỏ
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#433223] px-4 text-[#8d7f71] transition hover:border-[#7f5f31] hover:text-[#f4ead4] lg:w-[160px]"
        >
          <Trash2 className="h-4 w-4" />
          Bỏ lưu
        </button>
      </div>
    </article>
  )
}

function SavedPage() {
  const savedItems = useMarketStore((state) => state.savedItems)
  const removeSavedItem = useMarketStore((state) => state.removeSavedItem)
  const clearSavedItems = useMarketStore((state) => state.clearSavedItems)
  const addSavedItemToCart = useMarketStore((state) => state.addSavedItemToCart)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [sortMode, setSortMode] = useState<SortMode>('latest')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [currentPage, setCurrentPage] = useState(1)

  const categoryItems = useMemo(() => {
    const counts = new Map<string, number>()

    for (const item of savedItems) {
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1)
    }

    return [
      { value: 'All', label: 'Tất cả', count: savedItems.length },
      ...Array.from(counts.entries()).map(([value, count]) => ({
        value,
        label: CATEGORY_LABELS[value] ?? value,
        count,
      })),
    ]
  }, [savedItems])

  const filteredItems = useMemo(() => {
    const scopedItems =
      selectedCategory === 'All'
        ? savedItems
        : savedItems.filter((item) => item.category === selectedCategory)

    return [...scopedItems].sort((left, right) => {
      if (sortMode === 'price-desc') {
        return right.price - left.price
      }

      if (sortMode === 'price-asc') {
        return left.price - right.price
      }

      if (sortMode === 'rating') {
        return right.rating - left.rating || right.reviewCount - left.reviewCount
      }

      return right.id.localeCompare(left.id)
    })
  }, [savedItems, selectedCategory, sortMode])
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / SAVED_ITEMS_PER_PAGE))
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * SAVED_ITEMS_PER_PAGE
    return filteredItems.slice(startIndex, startIndex + SAVED_ITEMS_PER_PAGE)
  }, [currentPage, filteredItems])
  const paginationItems = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages],
  )

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  return (
    <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#090705] px-5 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <nav className="flex flex-wrap items-center gap-2 text-[1rem] text-[#877a6c]">
          <Link to="/" className="transition hover:text-[#f4e9d8]">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#f4efe6]">Đã lưu</span>
        </nav>

        <div className="mt-10 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#2d1c08] text-[#ffa11d]">
                <Heart className="h-5 w-5 fill-current" />
              </span>
              <h1 className="font-display text-[2rem] font-bold leading-none tracking-[-0.05em] text-[#f8f3ec] sm:text-[2.4rem]">
                Sản phẩm đã lưu
              </h1>
            </div>
            <p className="mt-3 text-[1rem] text-[#8d8276]">
              {savedItems.length} sản phẩm · cập nhật lần cuối hôm nay
            </p>
          </div>

          <button
            type="button"
            onClick={clearSavedItems}
            disabled={savedItems.length === 0}
            className="inline-flex h-12 items-center justify-center gap-2 self-start rounded-[14px] border border-[#403124] bg-[#15100c] px-5 text-[0.96rem] text-[#9e9080] transition hover:border-[#78592a] hover:text-[#f4ead4] disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Trash2 className="h-4 w-4" />
            Xóa tất cả
          </button>
        </div>

        <div className="mt-8 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap gap-3">
            {categoryItems.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  setSelectedCategory(item.value)
                  setCurrentPage(1)
                }}
                className={cn(
                  'inline-flex h-11 items-center rounded-full border px-5 text-[0.96rem] transition',
                  selectedCategory === item.value
                    ? 'border-[#8b5a15] bg-[#2c1d0a] font-bold text-[#ffb330]'
                    : 'border-[#34291e] bg-transparent text-[#a59481] hover:border-[#6d5125] hover:text-[#f4ead4]',
                )}
              >
                {item.label} ({item.count})
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select
              value={sortMode}
              onChange={(event) => {
                setSortMode(event.target.value as SortMode)
                setCurrentPage(1)
              }}
              className="h-11 min-w-[196px] rounded-[12px] border border-[#3a2e22] bg-[#17120d] px-4 text-[0.98rem] font-semibold text-[#f5eee1] outline-none transition focus:border-[#7e5e2d]"
            >
              <option value="latest">Mới lưu nhất</option>
              <option value="price-desc">Giá cao trước</option>
              <option value="price-asc">Giá thấp trước</option>
              <option value="rating">Đánh giá cao</option>
            </select>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-pressed={viewMode === 'grid'}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-[12px] border transition',
                  viewMode === 'grid'
                    ? 'border-[#8b5a15] bg-[#2c1d0a] text-[#ffb330]'
                    : 'border-[#3a2e22] bg-[#17120d] text-[#8f8273] hover:text-[#f5eee1]',
                )}
              >
                <Grid2X2 className="h-4.5 w-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-pressed={viewMode === 'list'}
                className={cn(
                  'inline-flex h-11 w-11 items-center justify-center rounded-[12px] border transition',
                  viewMode === 'list'
                    ? 'border-[#8b5a15] bg-[#2c1d0a] text-[#ffb330]'
                    : 'border-[#3a2e22] bg-[#17120d] text-[#8f8273] hover:text-[#f5eee1]',
                )}
              >
                <List className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="mt-6 rounded-[30px] border border-[#31261c] bg-[#17110d] px-6 py-12 text-center">
            <Heart className="mx-auto h-10 w-10 text-[#ffb330]" />
            <h2 className="mt-4 text-[1.4rem] font-bold text-[#f7f1e9]">
              Chưa có sản phẩm đã lưu
            </h2>
            <p className="mt-2 text-[#978875]">
              Thêm sản phẩm yêu thích để xem lại nhanh hơn.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {paginatedItems.map((item) => (
              <SavedGridCard
                key={item.id}
                item={item}
                onAddToCart={() => addSavedItemToCart(item.id)}
                onRemove={() => removeSavedItem(item.id)}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-[30px] border border-[#31261c] bg-[#17110d]">
            {paginatedItems.map((item) => (
              <SavedListRow
                key={item.id}
                item={item}
                onAddToCart={() => addSavedItemToCart(item.id)}
                onRemove={() => removeSavedItem(item.id)}
              />
            ))}
          </div>
        )}

        {filteredItems.length > SAVED_ITEMS_PER_PAGE ? (
          <div className="mt-8 flex flex-col gap-4 border-t border-[#221a10] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-[#8f8578]">
              Hiển thị {(currentPage - 1) * SAVED_ITEMS_PER_PAGE + 1}-
              {Math.min(currentPage * SAVED_ITEMS_PER_PAGE, filteredItems.length)} /{' '}
              {filteredItems.length} sản phẩm đã lưu
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[#3b2c18] bg-[#110d09] px-3 text-sm font-semibold text-[#eadfcb] transition hover:border-[#8b6f38] hover:text-[#ffcb63] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {paginationItems.map((item, index) =>
                item === '...' ? (
                  <span
                    key={`ellipsis-${index}`}
                    className="inline-flex h-10 min-w-10 items-center justify-center text-sm font-semibold text-[#7f7568]"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCurrentPage(item)}
                    aria-current={currentPage === item ? 'page' : undefined}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition ${
                      currentPage === item
                        ? 'border-[#f3b232] bg-[#f3b232] text-[#140f09]'
                        : 'border-[#3b2c18] bg-[#110d09] text-[#eadfcb] hover:border-[#8b6f38] hover:text-[#ffcb63]'
                    }`}
                  >
                    {item}
                  </button>
                ),
              )}

              <button
                type="button"
                onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[#3b2c18] bg-[#110d09] px-3 text-sm font-semibold text-[#eadfcb] transition hover:border-[#8b6f38] hover:text-[#ffcb63] disabled:cursor-not-allowed disabled:opacity-45"
                aria-label="Trang sau"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default SavedPage
