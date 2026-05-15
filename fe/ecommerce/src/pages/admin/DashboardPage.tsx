import { useMemo } from 'react'
import { ArrowUpRight } from 'lucide-react'
import { useMarketStore } from '../../store/useMarketStore'
import { AdminBadge, AdminPanel, formatAdminCurrency } from '../../components/admin/AdminUi'

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return ''
  }

  const max = Math.max(...values)
  const min = Math.min(...values)
  const range = Math.max(max - min, 1)

  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width
      const y = height - ((value - min) / range) * (height - 18) - 8
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function buildAreaPath(values: number[], width: number, height: number) {
  if (values.length === 0) {
    return ''
  }

  const linePath = buildLinePath(values, width, height)
  return `${linePath} L ${width} ${height} L 0 ${height} Z`
}

function formatCompactCurrency(value: number) {
  if (value >= 1000000) {
    const compactValue = value / 1000000
    const digits = compactValue >= 10 ? 1 : 2

    return `${compactValue.toFixed(digits).replace(/\.0$/, '')}M đ`
  }

  if (value >= 1000) {
    const compactValue = value / 1000
    const digits = compactValue >= 100 ? 0 : 1

    return `${compactValue.toFixed(digits).replace(/\.0$/, '')}K đ`
  }

  return `${value.toLocaleString('vi-VN')} đ`
}

function DashboardPage() {
  const products = useMarketStore((state) => state.products)
  const categories = useMarketStore((state) => state.categories)

  const metrics = useMemo(() => {
    const totalValue = products.reduce((sum, product) => sum + product.cost, 0)
    const avgRating = products.length
      ? products.reduce((sum, product) => sum + product.rating, 0) / products.length
      : 0
    const inStockCount = products.filter((product) => product.inStock !== false).length
    const inStockPct = products.length ? Math.round((inStockCount / products.length) * 100) : 0
    const onSale = products.filter(
      (product) => product.cost < (product.originalPrice ?? product.cost),
    ).length
    const activeCategories = categories.filter((category) => category.status === 'active').length

    return {
      totalValue,
      avgRating,
      inStockCount,
      inStockPct,
      onSale,
      activeCategories,
    }
  }, [categories, products])

  const categoryData = useMemo(
    () =>
      categories.map((category) => {
        const categoryProducts = products.filter((product) => product.category === category.name)

        return {
          ...category,
          count: categoryProducts.length,
          value: categoryProducts.reduce((sum, product) => sum + product.cost, 0),
        }
      }),
    [categories, products],
  )

  const maxCategoryCount = Math.max(...categoryData.map((item) => item.count), 1)
  const recentProducts = [...products].slice(-5).reverse()
  const valueSeries = categoryData.map((item) => item.value)
  const linePath = buildLinePath(valueSeries, 790, 150)
  const areaPath = buildAreaPath(valueSeries, 790, 150)
  const topValueCategory = categoryData.reduce<(typeof categoryData)[number] | null>(
    (best, item) => {
      if (!best || item.value > best.value) {
        return item
      }

      return best
    },
    null,
  )
  const topValueShare =
    metrics.totalValue > 0 && topValueCategory
      ? Math.round((topValueCategory.value / metrics.totalValue) * 100)
      : 0

  const stats = [
    {
      label: 'Tổng sản phẩm',
      value: String(products.length),
      sub: `${metrics.onSale} đang giảm giá`,
      accent: metrics.onSale > 0 ? 'text-emerald-400' : 'text-[#7a7570]',
    },
    {
      label: 'Danh mục',
      value: String(categories.length),
      sub: `${metrics.activeCategories} đang active`,
      accent: 'text-[#7a7570]',
    },
    {
      label: 'Tổng giá trị',
      value: formatCompactCurrency(metrics.totalValue),
      sub: `${metrics.inStockPct}% còn hàng`,
      accent: 'text-emerald-400',
    },
    {
      label: 'Đánh giá TB',
      value: metrics.avgRating.toFixed(1),
      sub: `${metrics.inStockCount}/${products.length} sản phẩm còn hàng`,
      accent: 'text-emerald-400',
    },
  ]

  return (
    <div className="h-full overflow-y-auto px-6 py-5 xl:px-7 xl:py-6">
      <section className="mb-5 grid gap-3 xl:grid-cols-4">
        {stats.map((stat) => (
          <AdminPanel key={stat.label} className="relative overflow-hidden p-5 xl:p-6">
            <div className="absolute right-0 top-0 h-14 w-14 rounded-bl-[28px] bg-[radial-gradient(circle_at_top_right,rgba(247,147,26,0.12),transparent_72%)]" />
            <div className="text-[10px] uppercase tracking-[0.24em] text-[#7a7570]">{stat.label}</div>
            <div className="mt-4 whitespace-nowrap font-display text-[2.55rem] font-bold leading-[0.92] text-white xl:text-[2.8rem]">
              {stat.value}
            </div>
            <div className={`mt-4 flex items-center gap-1.5 text-[0.98rem] ${stat.accent}`}>
              {stat.accent !== 'text-[#7a7570]' ? <ArrowUpRight size={14} strokeWidth={2.2} /> : null}
              <span>{stat.sub}</span>
            </div>
          </AdminPanel>
        ))}
      </section>

      <section className="mb-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_390px]">
        <AdminPanel className="p-5 xl:p-6">
          <h2 className="font-display text-[1.65rem] font-bold text-white xl:text-[1.8rem]">Sản phẩm theo danh mục</h2>
          <p className="mt-1.5 text-[0.98rem] text-[#7a7570]">
            Số lượng sản phẩm hiện có trong từng danh mục
          </p>

          <div className="mt-6">
            <div className="mb-2 grid grid-cols-[38px_minmax(0,1fr)] gap-3">
              <div className="flex h-[220px] flex-col justify-between pb-7 text-right text-[0.88rem] text-[#7a7570]">
                {[4, 3, 2, 1, 0].map((tick) => (
                  <span key={tick}>{tick}</span>
                ))}
              </div>
              <div className="relative h-[220px]">
                <div className="absolute inset-0 flex flex-col justify-between pb-7">
                  {[4, 3, 2, 1, 0].map((tick) => (
                    <div key={tick} className="border-t border-dashed border-[#2e2a24]" />
                  ))}
                </div>
                <div className="absolute inset-x-0 bottom-0 top-0 grid grid-cols-6 items-end gap-4">
                  {categoryData.map((item) => (
                    <div key={item.id} className="flex h-full flex-col justify-end">
                      <div
                        className="rounded-t-[7px] transition-[height] duration-500"
                        style={{
                          height: `${Math.max((item.count / Math.max(maxCategoryCount, 1)) * 126, 16)}px`,
                          backgroundColor: item.color,
                        }}
                      />
                      <div className="mt-2.5 text-center text-[0.88rem] text-[#9b958e]">{item.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AdminPanel>

        <AdminPanel className="p-5 xl:p-6">
          <h2 className="font-display text-[1.65rem] font-bold text-white xl:text-[1.8rem]">Phân bổ danh mục</h2>
          <p className="mt-1.5 text-[0.98rem] text-[#7a7570]">Tỷ lệ sản phẩm theo từng danh mục</p>

          <div className="mt-6 space-y-4">
            {categoryData.map((item) => (
              <div key={item.id}>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-[0.96rem] font-semibold text-white">{item.name}</span>
                  </div>
                  <span className="text-[0.96rem] text-[#9b958e]">{item.count}</span>
                </div>
                <div className="h-[5px] overflow-hidden rounded-full bg-[#3a332c]">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${(item.count / Math.max(maxCategoryCount, 1)) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </section>

      <AdminPanel className="mb-5 p-5 xl:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-[1.65rem] font-bold text-white xl:text-[1.8rem]">Giá trị theo danh mục</h2>
            <p className="mt-1.5 text-[0.98rem] text-[#7a7570]">
              Tổng giá trị sản phẩm đang hiển thị trong store
            </p>
          </div>
          <div className="pt-1 text-right">
            <div className="max-w-[240px] break-words font-display text-[1.9rem] font-bold leading-[0.94] text-[#f7931a] xl:text-[2.1rem]">
              {formatCompactCurrency(topValueCategory?.value ?? 0)}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 text-[0.95rem] text-emerald-400">
              <ArrowUpRight size={14} strokeWidth={2.2} />
              {topValueCategory ? `${topValueCategory.name} chiếm ${topValueShare}%` : 'Chưa có dữ liệu'}
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[20px]">
          <div className="absolute inset-x-0 top-4 space-y-7">
            {[0, 1, 2].map((item) => (
              <div key={item} className="border-t border-dashed border-[#2e2a24]" />
            ))}
          </div>
          <svg viewBox="0 0 790 150" className="h-[152px] w-full">
            <defs>
              <linearGradient id="admin-value-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f7931a" stopOpacity="0.22" />
                <stop offset="100%" stopColor="#f7931a" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#admin-value-fill)" />
            <path
              d={linePath}
              fill="none"
              stroke="#f7931a"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div
            className="mt-1 grid text-center text-[0.88rem] text-[#8d877f]"
            style={{ gridTemplateColumns: `repeat(${Math.max(categoryData.length, 1)}, minmax(0, 1fr))` }}
          >
            {categoryData.map((item) => (
              <div key={item.id}>{item.name}</div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2.5 md:grid-cols-3">
          {categoryData.map((item) => (
            <div
              key={item.id}
              className="rounded-[14px] border border-[#2e2a24] bg-black/10 px-3.5 py-3"
            >
              <div className="text-[0.88rem] text-[#7a7570]">{item.name}</div>
              <div className="mt-1.5 text-[1rem] font-semibold text-white">
                {formatCompactCurrency(item.value)}
              </div>
            </div>
          ))}
        </div>
      </AdminPanel>

      <AdminPanel className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#2e2a24] px-5 py-4 xl:px-6">
          <h2 className="font-display text-[1.65rem] font-bold text-white xl:text-[1.8rem]">Sản phẩm gần đây</h2>
          <span className="text-[0.95rem] text-[#7a7570]">{products.length} tổng</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="bg-black/10 text-[11px] uppercase tracking-[0.22em] text-[#7a7570]">
                <th className="px-5 py-3.5 font-medium xl:px-6">Tên sản phẩm</th>
                <th className="px-5 py-3.5 font-medium xl:px-6">Danh mục</th>
                <th className="px-5 py-3.5 font-medium xl:px-6">Giá</th>
                <th className="px-5 py-3.5 font-medium xl:px-6">Rating</th>
                <th className="px-5 py-3.5 font-medium xl:px-6">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((product) => {
                const category = categories.find((item) => item.name === product.category)
                const status = product.status ?? 'active'

                return (
                  <tr
                    key={product.id}
                    className="border-t border-[#2e2a24] transition hover:bg-white/[0.025]"
                  >
                    <td className="max-w-[320px] px-5 py-3.5 xl:px-6">
                      <div className="flex items-center gap-3.5">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-[#3a3530] bg-[#111]">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="truncate text-[0.96rem] font-semibold text-white">
                            {product.name}
                          </div>
                          <div className="mt-1 font-mono text-[11px] text-[#7a7570]">
                            {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 xl:px-6">
                      <div className="flex items-center gap-2 text-[0.9rem] text-[#9b958e]">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: category?.color ?? '#7a7570' }}
                        />
                        <span>{product.category}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-[0.96rem] font-semibold text-[#f7931a] xl:px-6">
                      {formatAdminCurrency(product.cost)}
                    </td>
                    <td className="px-5 py-3.5 text-[0.95rem] text-[#c8a84b] xl:px-6">
                      {'★'.repeat(Math.round(product.rating))}
                      <span className="ml-1 text-[0.9rem] text-[#9b958e]">{product.rating.toFixed(1)}</span>
                    </td>
                    <td className="px-5 py-3.5 xl:px-6">
                      <AdminBadge status={status} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </AdminPanel>
    </div>
  )
}

export default DashboardPage
