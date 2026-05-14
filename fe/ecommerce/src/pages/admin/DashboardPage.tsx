import { Boxes, Globe2, ShieldCheck, Wallet } from 'lucide-react'
import { useMemo } from 'react'
import { MetricCard } from '../../components/admin/MetricCard'
import { CategoryBadge } from '../../components/shared/CategoryBadge'
import { SectionEyebrow } from '../../components/shared/SectionEyebrow'
import { useMarketStore } from '../../store/useMarketStore'

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

function DashboardPage() {
  const products = useMarketStore((state) => state.products)

  const metrics = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + product.cost, 0)
    const categories = new Set(products.map((product) => product.category)).size
    const countries = new Set(products.map((product) => product.country)).size
    const avgRating =
      products.reduce((sum, product) => sum + product.rating, 0) / products.length

    return {
      totalValue,
      categories,
      countries,
      avgRating,
    }
  }, [products])

  const topProducts = [...products].sort((a, b) => b.cost - a.cost).slice(0, 4)

  return (
    <div className="space-y-8">
      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.8fr)]">
        <div className="surface overflow-hidden p-7">
          <SectionEyebrow>Catalog Overview</SectionEyebrow>
          <h1 className="max-w-3xl font-display text-4xl font-bold leading-tight text-white sm:text-5xl">
            Theo dõi quy mô catalog, cơ cấu danh mục và xuất xứ sản phẩm từ một nguồn dữ liệu chung.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-slate-400">
            Dashboard này đọc cùng state với storefront và trang quản trị sản phẩm,
            nên mọi cập nhật về giá, danh mục hoặc xuất xứ đều phản ánh ngay.
          </p>
        </div>

        <section className="surface-soft p-6">
          <SectionEyebrow>Sản phẩm nổi bật</SectionEyebrow>
          <div className="space-y-4">
            {topProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/4 px-4 py-4"
              >
                <div>
                  <p className="font-display text-lg font-semibold text-white">
                    {product.name}
                  </p>
                  <p className="meta-label mt-1">{product.country}</p>
                </div>
                <div className="text-right">
                  <CategoryBadge category={product.category} />
                  <p className="mt-2 font-display text-lg font-bold text-amber-300">
                    {formatCurrency(product.cost)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Tổng sản phẩm"
          value={String(products.length)}
          hint="Số item hiện đang hiển thị chung trên storefront và admin."
          icon={Boxes}
        />
        <MetricCard
          label="Tổng giá trị"
          value={formatCurrency(metrics.totalValue)}
          hint="Tổng giá niêm yết của toàn bộ catalog thời trang hiện tại."
          icon={Wallet}
        />
        <MetricCard
          label="Xuất xứ"
          value={String(metrics.countries)}
          hint="Số quốc gia hoặc nơi sản xuất đang có mặt trong catalog."
          icon={Globe2}
        />
        <MetricCard
          label="Đánh giá TB"
          value={metrics.avgRating.toFixed(1)}
          hint="Điểm đánh giá trung bình của các sản phẩm đang bán."
          icon={ShieldCheck}
        />
      </section>
    </div>
  )
}

export default DashboardPage
