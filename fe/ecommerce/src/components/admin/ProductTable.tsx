import type { Product } from '../../types/product'
import { CategoryBadge } from '../shared/CategoryBadge'
import { Button } from '../ui/button'

type ProductTableProps = {
  products: Product[]
  editingId: string | null
  onEdit: (product: Product) => void
  onDelete: (productId: string) => void
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export function ProductTable({
  products,
  editingId,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <section className="surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/6 px-6 py-5">
        <div>
          <h2 className="font-display text-xl font-semibold text-white">
            Catalog thời trang
          </h2>
          <p className="meta-label mt-1">danh sách sản phẩm đang dùng chung</p>
        </div>
        <span className="rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-2 font-sans text-xs font-semibold tracking-[0.08em] text-orange-300">
          {products.length} sản phẩm
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-black/25">
            <tr className="border-b border-white/6">
              {['ID', 'Tên', 'Giá', 'Xuất xứ', 'Danh mục', 'Rating', 'Thao tác'].map(
                (heading) => (
                  <th
                    key={heading}
                    className="px-6 py-4 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500"
                  >
                    {heading}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr
                key={product.id}
                className={`border-b border-white/5 ${
                  editingId === product.id
                    ? 'bg-orange-400/6'
                    : index % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-white/[0.02]'
                }`}
              >
                <td className="px-6 py-4 font-mono text-[10px] tracking-[0.18em] text-slate-500">
                  {product.id}
                </td>
                <td className="max-w-56 px-6 py-4 font-display text-base font-semibold text-white">
                  {product.name}
                </td>
                <td className="px-6 py-4 font-mono font-semibold text-amber-300">
                  {formatCurrency(product.cost)}
                </td>
                <td className="px-6 py-4 font-sans text-xs font-medium uppercase tracking-[0.08em] text-slate-400">
                  {product.country}
                </td>
                <td className="px-6 py-4">
                  <CategoryBadge category={product.category} />
                </td>
                <td className="px-6 py-4 font-mono text-xs tracking-[0.18em] text-amber-300">
                  {'★'.repeat(product.rating)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      className="px-3 py-2 text-[11px]"
                      onClick={() => onEdit(product)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="ghost"
                      className="border border-red-500/25 px-3 py-2 text-[11px] text-red-300 hover:bg-red-500/10 hover:text-red-200"
                      onClick={() => onDelete(product.id)}
                    >
                      Xóa
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
