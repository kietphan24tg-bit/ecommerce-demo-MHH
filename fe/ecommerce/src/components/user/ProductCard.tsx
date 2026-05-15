import { Link } from 'react-router-dom'
import type { Product } from '../../types/product'
import { PRODUCT_COPY } from '../../data/market'
import { RatingStars } from '../shared/RatingStars'
import { ProductIllustration } from './ProductIllustration'

type ProductCardProps = {
  product: Product
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)

export function ProductCard({ product }: ProductCardProps) {
  const localized = PRODUCT_COPY[product.id]
  const displayName = localized?.name ?? product.name
  const displayDescription = localized?.description ?? product.description
  const displayCategory = localized?.category ?? product.category
  const discount = product.originalPrice
    ? Math.max(0, Math.round((1 - product.cost / product.originalPrice) * 100))
    : null

  return (
    <Link
      to={`/products/${product.id}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-[24px] border border-[#342614] bg-[#090b10] transition duration-300 hover:-translate-y-1 hover:border-[#6f4d1c] hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]"
    >
      {discount ? (
        <div className="pointer-events-none absolute left-4 top-4 z-10 flex flex-wrap gap-2">
          {discount ? (
            <span className="rounded-full bg-[#ea580c] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-white shadow-[0_10px_24px_rgba(234,88,12,0.3)]">
              -{discount}%
            </span>
          ) : null}
        </div>
      ) : null}

      <ProductIllustration
        category={displayCategory}
        productId={product.id}
        image={product.image}
      />

      <div className="flex min-h-[248px] flex-1 flex-col bg-[linear-gradient(180deg,#0f1319_0%,#0b0e13_100%)] px-5 pb-6 pt-5 sm:px-6 sm:pb-7 sm:pt-5.5">
        <h3 className="max-w-[18ch] font-display text-[1.55rem] font-bold leading-[1.06] text-[#f3f5f9] sm:text-[1.72rem]">
          {displayName}
        </h3>
        <p className="mt-3 max-w-[30ch] flex-1 text-[0.98rem] leading-[1.72] text-[#98a4b7]">
          {displayDescription}
        </p>

        <div className="mt-6 flex items-end justify-between gap-4 border-t border-white/7 pt-5">
          <div>
            <p className="font-display text-[1.8rem] font-bold leading-none text-[#f5b024] sm:text-[1.9rem]">
              {formatCurrency(product.cost)}
            </p>
            {product.originalPrice ? (
              <p className="mt-2 text-sm font-medium text-[#8d887f] line-through">
                {formatCurrency(product.originalPrice)}
              </p>
            ) : null}
          </div>

          <div className="pb-1 text-right">
            <RatingStars rating={product.rating} />
          </div>
        </div>
      </div>
    </Link>
  )
}
