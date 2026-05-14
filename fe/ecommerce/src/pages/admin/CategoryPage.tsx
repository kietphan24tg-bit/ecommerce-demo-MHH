import { useMemo } from 'react'
import { CategoryBadge } from '../../components/shared/CategoryBadge'
import { SectionEyebrow } from '../../components/shared/SectionEyebrow'
import { useMarketStore } from '../../store/useMarketStore'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

function CategoryPage() {
  const products = useMarketStore((state) => state.products)

  const categoryStats = useMemo(() => {
    const grouped = new Map<
      string,
      { count: number; total: number; avgRating: number; countries: Set<string> }
    >()

    products.forEach((product) => {
      const current = grouped.get(product.category) ?? {
        count: 0,
        total: 0,
        avgRating: 0,
        countries: new Set<string>(),
      }

      current.count += 1
      current.total += product.cost
      current.avgRating += product.rating
      current.countries.add(product.country)

      grouped.set(product.category, current)
    })

    return [...grouped.entries()]
      .map(([category, stats]) => ({
        category,
        count: stats.count,
        total: stats.total,
        avgRating: stats.avgRating / stats.count,
        countries: stats.countries.size,
      }))
      .sort((a, b) => b.total - a.total)
  }, [products])

  return (
    <div className="space-y-8">
      <section className="surface p-7">
        <SectionEyebrow>Category Insight</SectionEyebrow>
        <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
          So sánh mật độ sản phẩm theo từng nhóm thời trang thay vì xem từng item rời rạc.
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-400">
          Mỗi thẻ cho biết quy mô danh mục, tổng giá trị, điểm đánh giá trung bình
          và độ phủ xuất xứ để hỗ trợ cân đối catalog nhanh hơn.
        </p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {categoryStats.map((item) => (
          <article key={item.category} className="surface p-6">
            <div className="flex items-center justify-between gap-4">
              <CategoryBadge category={item.category} />
              <span className="meta-label">{item.count} sản phẩm</span>
            </div>

            <div className="mt-6 grid gap-5">
              <div>
                <p className="font-display text-3xl font-bold text-white">
                  {formatCurrency(item.total)}
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Tổng giá trị niêm yết hiện có trong nhóm này.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="meta-label">Đánh giá TB</p>
                  <p className="mt-3 text-2xl font-semibold text-amber-300">
                    {item.avgRating.toFixed(1)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/4 p-4">
                  <p className="meta-label">Xuất xứ</p>
                  <p className="mt-3 text-2xl font-semibold text-white">
                    {item.countries}
                  </p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

export default CategoryPage
