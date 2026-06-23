import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { EmptyState } from '../../components/shared/EmptyState'
import { ProductCard } from '../../components/user/ProductCard'
import { ProductFilters as ProductFiltersPanel } from '../../components/user/ProductFilters'
import { Input } from '../../components/ui/input'
import { DEFAULT_FILTERS } from '../../data/market'
import { useMarketStore } from '../../store/useMarketStore'
import type { ProductFilters } from '../../types/product'

const PRODUCTS_PER_PAGE = 6
type PaginationItem = number | '...'

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

function ProductPage() {
  const products = useMarketStore((state) => state.products)
  const countryOptions = useMarketStore((state) => state.countryOptions)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [currentPage, setCurrentPage] = useState(1)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      if ((product.status ?? 'active') !== 'active') {
        return false
      }

      if (filters.country !== 'All' && product.country !== filters.country) {
        return false
      }

      if (product.cost < filters.costMin) {
        return false
      }

      const query = filters.description.trim().toLowerCase()
      if (
        query &&
        !product.name.toLowerCase().includes(query) &&
        !product.description.toLowerCase().includes(query)
      ) {
        return false
      }

      if (filters.category !== 'All' && product.category !== filters.category) {
        return false
      }

      if (filters.rating !== '' && product.rating < Number(filters.rating)) {
        return false
      }

      return true
    })
  }, [filters, products])

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE))

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE)
  }, [currentPage, filteredProducts])

  const paginationItems = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages],
  )

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  const setFilter = <K extends keyof ProductFilters>(
    key: K,
    value: ProductFilters[K],
  ) => {
    setCurrentPage(1)
    setFilters((current) => ({ ...current, [key]: value }))
  }

  return (
    <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#090705]">
      <div className="grid lg:grid-cols-[306px_minmax(0,1fr)] xl:grid-cols-[326px_minmax(0,1fr)]">
        <ProductFiltersPanel
          filters={filters}
          countryOptions={countryOptions}
          resultCount={filteredProducts.length}
          mobileOpen={mobileFiltersOpen}
          onChange={setFilter}
          onReset={() => {
            setCurrentPage(1)
            setFilters(DEFAULT_FILTERS)
          }}
          onMobileClose={() => setMobileFiltersOpen(false)}
        />

        <div className="min-w-0">
          <div className="sticky top-[69px] z-30 border-b border-[#221a10] bg-[#090705]/96 px-5 py-3.5 backdrop-blur-xl sm:px-6 lg:px-5 xl:px-6">
            <form
              className="flex gap-2 xl:gap-3"
              onSubmit={(event) => event.preventDefault()}
            >
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex h-11 shrink-0 items-center gap-2 rounded-[12px] border border-[#5a5144] bg-[#16110d] px-4 text-[0.98rem] font-semibold text-[#f6f0e4] transition hover:border-[#8b6f38] lg:hidden"
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">Lọc</span>
              </button>

              <Input
                value={filters.description}
                placeholder="Tìm áo, quần, giày, dép hoặc mô tả sản phẩm"
                onChange={(event) => setFilter('description', event.target.value)}
                className="h-11 flex-1 rounded-[10px] border-[#3a3125] bg-[#17120d] px-4 text-[0.98rem] font-medium text-[#ece3d1] placeholder:text-[#8e8476] focus:border-[#7f622b] focus:bg-[#1b1510]"
              />

              <button
                type="submit"
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-[12px] border border-[#5a5144] bg-transparent px-4 text-[0.98rem] font-semibold text-[#f6f0e4] transition hover:border-[#8b6f38] hover:bg-[#16110d] sm:px-5"
              >
                <Search className="h-4.5 w-4.5" />
                <span className="hidden sm:inline">Tìm kiếm</span>
              </button>
            </form>
          </div>

          <div className="px-4 py-4 sm:px-5 lg:px-5 xl:px-6">
            {filteredProducts.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Thử đổi từ khóa, mở rộng mức giá hoặc chọn lại danh mục để xem thêm mẫu thời trang."
              />
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                <div className="mt-8 flex flex-col gap-4 border-t border-[#221a10] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-[#8f8578]">
                    Hiển thị {(currentPage - 1) * PRODUCTS_PER_PAGE + 1}-
                    {Math.min(currentPage * PRODUCTS_PER_PAGE, filteredProducts.length)} /{' '}
                    {filteredProducts.length} sản phẩm
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="inline-flex h-10 min-w-10 items-center justify-center rounded-full border border-[#3b2c18] bg-[#110d09] px-3 text-sm font-semibold text-[#eadfcb] transition hover:border-[#8b6f38] hover:text-[#ffcb63] disabled:cursor-not-allowed disabled:opacity-45"
                      aria-label="Trang truoc"
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
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductPage
