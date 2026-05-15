import {
  ChevronRight,
  Heart,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Truck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/shared/EmptyState'
import { CategoryBadge } from '../../components/shared/CategoryBadge'
import { RatingStars } from '../../components/shared/RatingStars'
import { cn } from '../../lib/utils'
import { useMarketStore } from '../../store/useMarketStore'
import type { Product, ProductBenefit } from '../../types/product'

type MediaItem = {
  id: string
  image: string
  label: string
  className: string
}

function getPreferredSizeIndex(product: Product) {
  const category = product.category.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  const candidates =
    category.includes('ao')
      ? ['M', 'L']
      : category.includes('quan')
        ? ['32', 'M', '31']
        : category.includes('giay')
          ? ['41', '42']
          : category.includes('dep')
            ? ['41', '42']
            : ['95', 'M-L', 'One size']

  const matchIndex = candidates
    .map((candidate) => product.sizes.indexOf(candidate))
    .find((index) => index >= 0)

  if (typeof matchIndex === 'number') {
    return matchIndex
  }

  return Math.max(0, Math.floor((product.sizes.length - 1) / 2))
}

function getSizeGuide(product: Product) {
  const normalizedName = product.name.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
  const category = product.category.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

  if (product.sizes.length === 1 && product.sizes[0] === 'One size') {
    return 'Mẫu này dùng kích thước tiêu chuẩn, bạn chỉ cần chọn màu phù hợp outfit.'
  }

  if (category.includes('ao')) {
    if (normalizedName.includes('bomber') || normalizedName.includes('khoac')) {
      return 'Form outerwear thiên rộng. Nếu có mặc layering dày bên trong, nên tăng thêm 1 size.'
    }

    if (normalizedName.includes('len')) {
      return 'Áo len ôm thân vừa phải. Nếu thích cảm giác thoải mái hơn, nên tăng 1 size.'
    }

    return 'Form regular unisex khá chuẩn. Size M thường là lựa chọn cân bằng nhất.'
  }

  if (category.includes('quan')) {
    if (normalizedName.includes('jeans') || normalizedName.includes('cargo')) {
      return 'Chọn theo vòng eo. Nếu thích form relaxed hoặc mặc hạ hông, có thể tăng 1 size.'
    }

    if (normalizedName.includes('short')) {
      return 'Short cạp vừa, ống thoáng. Size M là lựa chọn an toàn cho form regular.'
    }

    return 'Quần suông đẹp nhất khi vừa eo. Nếu muốn rơi ống nhiều hơn, tăng 1 size.'
  }

  if (category.includes('giay')) {
    if (normalizedName.includes('boots')) {
      return 'Boots ôm mu bàn chân hơn sneaker. Nếu đi tất dày, nên tăng nửa đến một size.'
    }

    return 'Form giày chuẩn. Size 41 phù hợp với bàn chân nam trung bình.'
  }

  if (category.includes('dep')) {
    return 'Dép đi thoải mái hơn khi dư nhẹ phần gót. Nếu phân vân giữa hai size, chọn size lớn hơn.'
  }

  if (normalizedName.includes('that lung') || normalizedName.includes('belt')) {
    return 'Chọn theo vòng eo quần. Size 95 hợp waist 29-30, size 100 hợp 31-32.'
  }

  if (normalizedName.includes('mu')) {
    return 'Nón có khóa chỉnh phía sau, chỉ cần chọn theo chu vi đầu gần đúng.'
  }

  return product.sizeGuide
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function buildMediaItems(product: Product): MediaItem[] {
  const [mainImage, studioImage, detailImage] = product.images

  return [
    {
      id: 'main',
      image: mainImage ?? product.image,
      label: 'Ảnh chính',
      className: 'object-cover object-center',
    },
    {
      id: 'studio',
      image: studioImage ?? product.image,
      label: 'Studio',
      className: 'object-cover object-top',
    },
    {
      id: 'detail',
      image: detailImage ?? product.image,
      label: 'Cận cảnh',
      className: 'object-cover object-[center_32%] contrast-110 saturate-[1.08]',
    },
  ]
}

function ProductHeroMedia({
  product,
  selectedMedia,
}: {
  product: Product
  selectedMedia: MediaItem
}) {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-[#2a2114] bg-[linear-gradient(180deg,#1d1811_0%,#14110d_100%)]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_28%,rgba(244,171,34,0.18),transparent_34%)]" />
      <div className="absolute right-5 top-5 z-10">
        <CategoryBadge category={product.category} />
      </div>

      <div className="relative flex min-h-[420px] items-center justify-center p-8 sm:min-h-[520px] sm:p-10">
        <div className="relative h-[280px] w-full max-w-[420px] overflow-hidden shadow-[0_32px_70px_rgba(0,0,0,0.28)] sm:h-[360px]">
          <img
            src={selectedMedia.image}
            alt={product.name}
            className={cn('h-full w-full rounded-[12px]', selectedMedia.className)}
          />
        </div>
      </div>
    </div>
  )
}

function benefitIcon(title: string) {
  if (title.toLowerCase().includes('vận chuyển')) {
    return Truck
  }

  if (title.toLowerCase().includes('đổi')) {
    return RefreshCcw
  }

  return ShieldCheck
}

function ProductDetailPage() {
  const { id } = useParams()
  const products = useMarketStore((state) => state.products)
  const product = products.find((item) => item.id === id && (item.status ?? 'active') === 'active')

  const mediaItems = useMemo(() => (product ? buildMediaItems(product) : []), [product])

  const [selectedMediaId, setSelectedMediaId] = useState('main')
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (!product) {
      return
    }

    setSelectedMediaId('main')
    setSelectedColor(0)
    setSelectedSize(getPreferredSizeIndex(product))
    setQuantity(1)
  }, [id, product])

  if (!product) {
    return (
      <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#120e0a] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1280px] py-12">
          <EmptyState
            title="Không tìm thấy sản phẩm"
            description="Liên kết này không còn hợp lệ hoặc sản phẩm đã được gỡ khỏi danh sách."
          />
          <div className="mt-5 flex justify-center">
            <Link
              to="/"
              className="inline-flex items-center rounded-full border border-[#4c3922] px-5 py-3 text-sm font-semibold text-[#f4e7ce] transition hover:border-[#8b6f38] hover:text-[#f4b321]"
            >
              Quay về danh sách sản phẩm
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const selectedMedia =
    mediaItems.find((item) => item.id === selectedMediaId) ?? mediaItems[0]
  const selectedColorData = product.colors[selectedColor] ?? product.colors[0]
  const selectedSizeData = product.sizes[selectedSize] ?? product.sizes[0]
  const displaySizeGuide = getSizeGuide(product)
  const discount = product.originalPrice
    ? Math.max(0, Math.round((1 - product.cost / product.originalPrice) * 100))
    : null

  return (
    <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#120e0a] px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1280px]">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-medium text-[#8b816f]">
          <Link to="/" className="transition hover:text-[#f4e7ce]">
            Trang chủ
          </Link>
          <ChevronRight className="h-4 w-4 text-[#5d5447]" />
          <span>{product.category}</span>
          <ChevronRight className="h-4 w-4 text-[#5d5447]" />
          <span className="text-[#f4b321]">{product.name}</span>
        </nav>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.04fr)_minmax(420px,0.96fr)]">
          <div className="min-w-0">
            <ProductHeroMedia product={product} selectedMedia={selectedMedia} />

            <div className="mt-4 grid grid-cols-3 gap-3">
              {mediaItems.map((item) => {
                const isActive = item.id === selectedMedia.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedMediaId(item.id)}
                    className={cn(
                      'group relative flex h-[92px] items-center justify-center overflow-hidden rounded-[16px] border bg-[#17130f] transition',
                      isActive
                        ? 'border-[#f4b321] shadow-[0_0_0_1px_rgba(244,179,33,0.25)]'
                        : 'border-[#2a2114] hover:border-[#6f5430]',
                    )}
                    aria-label={item.label}
                  >
                    <img
                      src={item.image}
                      alt={item.label}
                      className={cn('h-full w-full object-cover', item.className)}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/26 to-transparent" />
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-w-0 xl:pt-0.5">
            <div className="rounded-[28px] border border-[#2a2114] bg-[linear-gradient(180deg,#120f0c_0%,#0f0d0a_100%)] p-5 sm:p-6 lg:p-7">
              <div className="mb-5 rounded-[10px] bg-[#1c1813] px-4 py-2 font-mono text-sm tracking-[0.12em] text-[#807562]">
                {product.id}
              </div>

              <h1 className="max-w-[15ch] font-display text-[1.9rem] font-bold leading-[1.02] tracking-[-0.02em] text-[#f4efe7] sm:text-[2.2rem] lg:text-[2.35rem]">
                {product.name}
              </h1>

              <div className="mt-5 flex items-center gap-3">
                <RatingStars rating={product.rating} />
                <span className="text-sm text-[#7f7568]">{product.rating}.0 / 5</span>
              </div>

              <div className="mt-5 flex flex-wrap items-end gap-3">
                <p className="font-display text-[2.15rem] font-bold leading-none tracking-[-0.03em] text-[#f4b321] sm:text-[2.45rem] lg:text-[2.6rem]">
                  {formatCurrency(product.cost)}
                </p>
                {product.originalPrice ? (
                  <p className="pb-1 text-lg font-medium text-[#8b816f] line-through">
                    {formatCurrency(product.originalPrice)}
                  </p>
                ) : null}
                {discount ? (
                  <span className="inline-flex rounded-full bg-[#ea580c] px-3 py-1 text-sm font-bold text-white">
                    -{discount}%
                  </span>
                ) : null}
              </div>

              <div className="mt-6 border-t border-[#2a2114] pt-5">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7f7568]">
                    Màu sắc
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.colors.map((color, index) => {
                      const isActive = selectedColor === index

                      return (
                        <button
                          key={`${color.name}-${color.hex}`}
                          type="button"
                          onClick={() => setSelectedColor(index)}
                          className={cn(
                            'relative h-10 w-10 rounded-full border transition',
                            isActive
                              ? 'border-[#f4b321] shadow-[0_0_0_3px_rgba(244,179,33,0.18)]'
                              : 'border-transparent hover:border-[#6f5430]',
                          )}
                          aria-label={color.name}
                        >
                          <span
                            className="absolute inset-[3px] rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      )
                    })}
                  </div>

                  <p className="mt-3 text-sm font-semibold text-[#f4b321]">
                    {selectedColorData?.name}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7f7568]">
                    Kích cỡ
                  </p>

                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.sizes.map((size, index) => {
                      const isActive = selectedSize === index

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(index)}
                          className={cn(
                            'inline-flex min-w-[58px] items-center justify-center rounded-[12px] border px-3.5 py-2.5 text-base font-semibold transition sm:min-w-[62px]',
                            isActive
                              ? 'border-[#f4b321] bg-[#f4b321] text-[#1a140c]'
                              : 'border-[#30261a] bg-[#18130f] text-[#f0e3c8] hover:border-[#6f5430]',
                          )}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>

                  <div className="mt-3 inline-flex items-center gap-2 text-sm text-[#8b816f]">
                    <Ruler className="h-4 w-4" />
                    <span>{displaySizeGuide}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#7f7568]">
                    Số lượng
                  </p>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="inline-flex items-center overflow-hidden rounded-[14px] border border-[#4a4135] bg-[#120f0c]">
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                        className="flex h-11 w-11 items-center justify-center text-2xl text-[#f0e3c8] transition hover:bg-white/5"
                        aria-label="Giảm số lượng"
                      >
                        -
                      </button>
                      <span className="flex h-11 min-w-14 items-center justify-center border-x border-[#4a4135] text-xl font-semibold text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((value) => Math.min(9, value + 1))}
                        className="flex h-11 w-11 items-center justify-center text-2xl text-[#f0e3c8] transition hover:bg-white/5"
                        aria-label="Tăng số lượng"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm text-[#8b816f]">Size đã chọn: {selectedSizeData}</span>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#5a4a31] bg-[#17120d] px-5 py-4 text-lg font-extrabold uppercase tracking-[0.04em] text-[#f7f1e3] transition hover:border-[#f4b321] hover:text-[#f4b321]"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Thêm vào giỏ hàng
                  </button>

                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#3b3124] bg-transparent px-5 py-4 text-lg font-bold text-[#efe3c7] transition hover:border-[#6f5430] hover:text-white"
                  >
                    <Heart className="h-5 w-5" />
                    Lưu yêu thích
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-[#2a2114] bg-[linear-gradient(180deg,#14110d_0%,#100d0a_100%)] p-5 sm:p-6 lg:p-7">
          <div className="grid gap-4 lg:grid-cols-3">
            {product.benefits.map((benefit) => {
              const Icon = benefitIcon(benefit.title)

              return (
                <BenefitCard key={benefit.title} benefit={benefit} Icon={Icon} />
              )
            })}
          </div>

          <div className="mt-8 max-w-[960px]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7f7568]">
              Mô tả sản phẩm
            </p>
            <p className="mt-4 text-xl leading-[1.8] text-[#b7ab96]">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-[#33291c] bg-[#17130f] px-4 py-2 text-base text-[#948771]"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function BenefitCard({
  benefit,
  Icon,
}: {
  benefit: ProductBenefit
  Icon: typeof Truck
}) {
  return (
    <div className="rounded-[18px] border border-[#322719] bg-[#1a1611] px-5 py-4">
      <div className="flex items-start gap-4">
        <Icon className="mt-1 h-6 w-6 text-[#f4b321]" />
        <div>
          <p className="text-[1.35rem] font-bold text-[#f3ead7]">{benefit.title}</p>
          <p className="mt-1 text-lg text-[#9d8d73]">{benefit.description}</p>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage
