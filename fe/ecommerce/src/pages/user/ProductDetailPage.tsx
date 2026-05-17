import {
  ChevronRight,
  Heart,
  MessageSquareMore,
  RefreshCcw,
  Ruler,
  ShieldCheck,
  ShoppingCart,
  Star,
  ThumbsUp,
  Truck,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { EmptyState } from '../../components/shared/EmptyState'
import { CategoryBadge } from '../../components/shared/CategoryBadge'
import { RatingStars } from '../../components/shared/RatingStars'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { createProductMockData } from '../../data/market'
import { cn } from '../../lib/utils'
import { useMarketStore } from '../../store/useMarketStore'
import type { Product, ProductBenefit, ProductReview } from '../../types/product'

type MediaItem = {
  id: string
  image: string
  label: string
  className: string
}

type ReviewFilter = 'all' | 5 | 4 | 3 | 2 | 1
type ReviewSort = 'newest' | 'highest' | 'lowest'

type ReviewDraft = {
  rating: number
  color: string
  size: string
  comment: string
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

function formatReviewDate(value: string) {
  const parsed = new Date(value)

  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('vi-VN').format(parsed)
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

function benefitIcon(title: string) {
  const normalized = title.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()

  if (normalized.includes('van chuyen')) {
    return Truck
  }

  if (normalized.includes('doi')) {
    return RefreshCcw
  }

  return ShieldCheck
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

function getReviewMoodLabel(rating: number) {
  if (rating >= 4.5) {
    return 'Rất hài lòng'
  }

  if (rating >= 4) {
    return 'Đa số khách hàng hài lòng'
  }

  if (rating >= 3) {
    return 'Phản hồi ở mức ổn'
  }

  return 'Cần thêm phản hồi tốt hơn'
}

function ProductDetailPage() {
  const { id } = useParams()
  const products = useMarketStore((state) => state.products)
  const savedItems = useMarketStore((state) => state.savedItems)
  const addProductToCart = useMarketStore((state) => state.addProductToCart)
  const toggleSavedProduct = useMarketStore((state) => state.toggleSavedProduct)
  const product = products.find((item) => item.id === id && (item.status ?? 'active') === 'active')

  const mediaItems = useMemo(() => (product ? buildMediaItems(product) : []), [product])

  const [selectedMediaId, setSelectedMediaId] = useState('main')
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedSize, setSelectedSize] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>('all')
  const [reviewSort, setReviewSort] = useState<ReviewSort>('newest')
  const [isReviewComposerOpen, setIsReviewComposerOpen] = useState(false)
  const [userReviews, setUserReviews] = useState<ProductReview[]>([])
  const [reviewDraft, setReviewDraft] = useState<ReviewDraft>({
    rating: 0,
    color: '',
    size: '',
    comment: '',
  })

  useEffect(() => {
    if (!product) {
      return
    }

    const preferredSize = getPreferredSizeIndex(product)

    setSelectedMediaId('main')
    setSelectedColor(0)
    setSelectedSize(preferredSize)
    setQuantity(1)
    setReviewFilter('all')
    setReviewSort('newest')
    setIsReviewComposerOpen(false)
    setUserReviews([])
    setReviewDraft({
      rating: 0,
      color: product.colors[0]?.name ?? '',
      size: product.sizes[preferredSize] ?? product.sizes[0] ?? '',
      comment: '',
    })
  }, [id, product])

  const productReviews = useMemo(() => {
    if (!product) {
      return []
    }

    const existingReviews = product.reviews ?? []

    if (existingReviews.length > 0) {
      return existingReviews
    }

    return createProductMockData({
      id: product.id,
      name: product.name,
      image: product.image,
      country: product.country,
      category: product.category,
      rating: product.rating,
    }).reviews
  }, [product])

  const allReviews = useMemo(() => [...userReviews, ...productReviews], [productReviews, userReviews])

  const reviewBreakdown = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => ({
        star,
        count: allReviews.filter((review) => review.rating === star).length,
      })),
    [allReviews],
  )

  const averageRating =
    allReviews.length > 0
      ? Number(
          (
            allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
          ).toFixed(1),
        )
      : 0

  const filteredReviews = useMemo(() => {
    const nextReviews =
      reviewFilter === 'all'
        ? allReviews
        : allReviews.filter((review) => review.rating === reviewFilter)

    const sortedReviews = [...nextReviews]

    sortedReviews.sort((left, right) => {
      if (reviewSort === 'highest') {
        return right.rating - left.rating
      }

      if (reviewSort === 'lowest') {
        return left.rating - right.rating
      }

      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
    })

    return sortedReviews
  }, [allReviews, reviewFilter, reviewSort])

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

  const selectedMedia = mediaItems.find((item) => item.id === selectedMediaId) ?? mediaItems[0]
  const selectedColorData = product.colors[selectedColor] ?? product.colors[0]
  const selectedSizeData = product.sizes[selectedSize] ?? product.sizes[0]
  const displaySizeGuide = getSizeGuide(product)
  const isSaved = savedItems.some(
    (item) => item.productId === product.id && item.size === selectedSizeData,
  )
  const displayTags = product.tags.map((tag) =>
    tag.toLowerCase().includes('đánh giá') || tag.toLowerCase().includes('danh gia')
      ? 'Đánh giá 0/5'
      : tag,
  )
  const discount = product.originalPrice
    ? Math.max(0, Math.round((1 - product.cost / product.originalPrice) * 100))
    : null

  function handleSubmitReview() {
    if (!product) {
      return
    }

    if (!reviewDraft.rating || !reviewDraft.color || !reviewDraft.size || !reviewDraft.comment.trim()) {
      return
    }

    const nextReview: ProductReview = {
      id: `local-review-${product.id}-${Date.now()}`,
      author: 'Bạn',
      rating: reviewDraft.rating,
      color: reviewDraft.color,
      size: reviewDraft.size,
      comment: reviewDraft.comment.trim(),
      createdAt: new Date().toISOString(),
      helpfulCount: 0,
      verifiedPurchase: true,
    }

    setUserReviews((current) => [nextReview, ...current])
    setReviewFilter('all')
    setReviewSort('newest')
    setIsReviewComposerOpen(false)
    setReviewDraft({
      rating: 0,
      color: selectedColorData?.name ?? product.colors[0]?.name ?? '',
      size: selectedSizeData ?? product.sizes[0] ?? '',
      comment: '',
    })
  }

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
                    onClick={() =>
                      addProductToCart(product, {
                        quantity,
                        colorIndex: selectedColor,
                        sizeIndex: selectedSize,
                      })
                    }
                    className="inline-flex w-full items-center justify-center gap-3 rounded-[14px] border border-[#5a4a31] bg-[#17120d] px-5 py-4 text-lg font-extrabold uppercase tracking-[0.04em] text-[#f7f1e3] transition hover:border-[#f4b321] hover:text-[#f4b321]"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Thêm vào giỏ hàng
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      toggleSavedProduct(product, {
                        colorIndex: selectedColor,
                        sizeIndex: selectedSize,
                      })
                    }
                    className={cn(
                      'inline-flex w-full items-center justify-center gap-3 rounded-[14px] px-5 py-4 text-lg font-bold transition',
                      isSaved
                        ? 'border border-[#f4b321] bg-[#f4b321] text-[#1a140c]'
                        : 'border border-[#3b3124] bg-transparent text-[#efe3c7] hover:border-[#6f5430] hover:text-white',
                    )}
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

              return <BenefitCard key={benefit.title} benefit={benefit} Icon={Icon} />
            })}
          </div>

          <div className="mt-8 max-w-[960px]">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#7f7568]">
              Mô tả sản phẩm
            </p>
            <p className="mt-4 text-xl leading-[1.8] text-[#b7ab96]">{product.description}</p>

            <div className="mt-5 flex flex-wrap gap-3">
              {displayTags.map((tag) => (
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

        <section className="mt-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 className="text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-[#f4efe7] sm:text-[2.2rem]">
                Đánh giá sản phẩm
              </h2>
              <p className="mt-3 text-base text-[#8f8473]">
                {allReviews.length} đánh giá từ khách hàng đã mua
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsReviewComposerOpen((current) => !current)
                setReviewDraft((current) => ({
                  ...current,
                  color: current.color || selectedColorData?.name || product.colors[0]?.name || '',
                  size: current.size || selectedSizeData || product.sizes[0] || '',
                }))
              }}
              className="inline-flex items-center justify-center gap-3 rounded-[16px] bg-[linear-gradient(90deg,#f97316_0%,#f59e0b_100%)] px-6 py-4 text-base font-bold text-[#1d1206] transition hover:scale-[1.01]"
            >
              <MessageSquareMore className="h-5 w-5" />
              Viết đánh giá
            </button>
          </div>

          <div className="mt-6 rounded-[30px] border border-[#2a2114] bg-[linear-gradient(180deg,#1a1611_0%,#15110d_100%)] p-5 sm:p-6 lg:p-7">
            <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)] lg:items-center">
              <div className="lg:border-r lg:border-[#302519] lg:pr-8">
                <p className="font-display text-[4.5rem] font-bold leading-none tracking-[-0.05em] text-[#f4b321]">
                  {averageRating.toFixed(1)}
                </p>
                <div className="mt-3">
                  <RatingStars rating={Math.round(averageRating)} />
                </div>
                <p className="mt-4 text-lg text-[#a89a84]">{allReviews.length} lượt đánh giá</p>
                <p className="mt-3 text-sm font-semibold text-[#4ade80]">
                  {getReviewMoodLabel(averageRating)}
                </p>
              </div>

              <div className="space-y-4">
                {reviewBreakdown.map((item) => {
                  const ratio = allReviews.length > 0 ? (item.count / allReviews.length) * 100 : 0
                  const barColor =
                    item.star >= 4
                      ? 'from-[#f59e0b] to-[#fb923c]'
                      : item.star === 3
                        ? 'from-[#d8b14e] to-[#cda843]'
                        : 'from-[#ef4444] to-[#f97316]'

                  return (
                    <div key={item.star} className="grid grid-cols-[48px_minmax(0,1fr)_78px] items-center gap-4">
                      <span className="text-sm font-semibold text-[#d8c9ae]">{item.star} ★</span>
                      <div className="h-3 overflow-hidden rounded-full bg-[#302821]">
                        <div
                          className={cn('h-full rounded-full bg-gradient-to-r transition-[width]', barColor)}
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                      <span className="text-right text-sm text-[#8f8473]">
                        {item.count} ({Math.round(ratio)}%)
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {isReviewComposerOpen ? (
            <div className="mt-6 rounded-[28px] border border-[#3a2b1a] bg-[linear-gradient(180deg,#1b1610_0%,#14100c_100%)] p-5 sm:p-6 lg:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-[1.7rem] font-bold text-[#f4efe7]">Viết đánh giá của bạn</h3>
                  <p className="mt-2 text-base text-[#8f8473]">
                    Chỉ cần chọn số sao, màu đã mua, size đã mua và để lại nhận xét ngắn.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReviewComposerOpen(false)}
                  className="rounded-full border border-[#35291c] p-2 text-[#8f8473] transition hover:border-[#6f5430] hover:text-[#f4efe7]"
                  aria-label="Đóng form đánh giá"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f8473]">
                  Mức độ hài lòng <span className="text-[#fb7185]">*</span>
                </p>
                <div className="mt-4 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isActive = reviewDraft.rating >= star

                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewDraft((current) => ({ ...current, rating: star }))}
                        className="group rounded-full p-1.5 transition"
                        aria-label={`Chọn ${star} sao`}
                      >
                        <Star
                          className={cn(
                            'h-11 w-11 transition',
                            isActive
                              ? 'fill-[#f4b321] text-[#f4b321]'
                              : 'fill-transparent text-[#4a4035] group-hover:text-[#8b6f38]',
                          )}
                          strokeWidth={1.8}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f8473]">
                    Màu đã mua
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.colors.map((color) => {
                      const isActive = reviewDraft.color === color.name

                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setReviewDraft((current) => ({ ...current, color: color.name }))}
                          className={cn(
                            'inline-flex items-center gap-3 rounded-full border px-4 py-2.5 text-sm font-semibold transition',
                            isActive
                              ? 'border-[#f4b321] bg-[#20170d] text-[#f4efe7]'
                              : 'border-[#33291c] bg-[#12100d] text-[#b7ab96] hover:border-[#6f5430]',
                          )}
                        >
                          <span
                            className="h-3 w-3 rounded-full ring-1 ring-white/10"
                            style={{ backgroundColor: color.hex }}
                          />
                          {color.name}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f8473]">
                    Size đã mua
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    {product.sizes.map((size) => {
                      const isActive = reviewDraft.size === size

                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setReviewDraft((current) => ({ ...current, size }))}
                          className={cn(
                            'inline-flex min-w-[64px] items-center justify-center rounded-[14px] border px-4 py-3 text-sm font-semibold transition',
                            isActive
                              ? 'border-[#f4b321] bg-[#20170d] text-[#f4efe7]'
                              : 'border-[#33291c] bg-[#12100d] text-[#b7ab96] hover:border-[#6f5430]',
                          )}
                        >
                          {size}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8f8473]">
                    Nhận xét
                  </p>
                  <span className="text-sm text-[#8f8473]">{reviewDraft.comment.trim().length} ký tự</span>
                </div>
                <Textarea
                  value={reviewDraft.comment}
                  onChange={(event) =>
                    setReviewDraft((current) => ({ ...current, comment: event.target.value }))
                  }
                  placeholder="Ví dụ: form mặc lên thế nào, màu thực tế ra sao, size có chuẩn không..."
                  className="mt-3 min-h-[140px] rounded-[18px] border-[#302519] bg-[#12100d] px-4 py-3 text-base text-[#f4efe7] placeholder:text-[#6f6558]"
                />
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsReviewComposerOpen(false)}
                  className="inline-flex items-center justify-center rounded-[14px] border border-[#33291c] px-5 py-3 font-semibold text-[#b7ab96] transition hover:border-[#6f5430] hover:text-[#f4efe7]"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSubmitReview}
                  disabled={
                    !reviewDraft.rating ||
                    !reviewDraft.color ||
                    !reviewDraft.size ||
                    !reviewDraft.comment.trim()
                  }
                  className="inline-flex items-center justify-center rounded-[14px] bg-[linear-gradient(90deg,#f97316_0%,#f59e0b_100%)] px-6 py-3 font-bold text-[#1d1206] transition enabled:hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Gửi đánh giá
                </button>
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-3">
              {([
                { value: 'all', label: `Tất cả (${allReviews.length})` },
                ...reviewBreakdown
                  .filter((item) => item.count > 0)
                  .map((item) => ({
                    value: item.star as ReviewFilter,
                    label: `${item.star} ★ (${item.count})`,
                  })),
              ] as { value: ReviewFilter; label: string }[]).map((item) => {
                const isActive = reviewFilter === item.value

                return (
                  <button
                    key={String(item.value)}
                    type="button"
                    onClick={() => setReviewFilter(item.value)}
                    className={cn(
                      'rounded-full border px-4 py-2.5 text-sm font-semibold transition',
                      isActive
                        ? 'border-[#6b4b16] bg-[#2a1d0b] text-[#f4b321]'
                        : 'border-[#302519] bg-transparent text-[#8f8473] hover:border-[#6f5430] hover:text-[#f4efe7]',
                    )}
                  >
                    {item.label}
                  </button>
                )
              })}
            </div>

            <Select
              value={reviewSort}
              onChange={(event) => setReviewSort(event.target.value as ReviewSort)}
              className="h-12 w-full rounded-[14px] border-[#302519] bg-[#15110d] text-[#f4efe7] lg:w-[160px] lg:min-w-[160px]"
            >
              <option value="newest">Mới nhất</option>
              <option value="highest">Sao cao trước</option>
              <option value="lowest">Sao thấp trước</option>
            </Select>
          </div>

          <div className="mt-6 space-y-4">
            {filteredReviews.map((review) => (
              <article
                key={review.id}
                className="rounded-[28px] border border-[#2a2114] bg-[linear-gradient(180deg,#17130f_0%,#14110d_100%)] p-5 sm:p-6 lg:p-7"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#fb923c_0%,#f97316_100%)] text-lg font-bold text-white">
                      {review.author.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xl font-bold text-[#f4efe7]">{review.author}</p>
                        {review.verifiedPurchase ? (
                          <span className="inline-flex rounded-full border border-[#14532d] bg-[#0f2b19] px-3 py-1 text-sm font-semibold text-[#4ade80]">
                            Đã mua
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-[#a89a84]">
                        <RatingStars rating={review.rating} />
                        <span>Màu: {review.color}</span>
                        <span>Size: {review.size}</span>
                      </div>
                    </div>
                  </div>

                  <p className="shrink-0 text-sm text-[#8f8473]">{formatReviewDate(review.createdAt)}</p>
                </div>

                <p className="mt-5 max-w-[72ch] text-lg leading-[1.9] text-[#e7decd]">{review.comment}</p>

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-[#2c2318] pt-5">
                  <span className="text-sm text-[#746957]">Đánh giá này có hữu ích không?</span>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-[12px] border border-[#35291c] px-4 py-2 text-sm text-[#b7ab96] transition hover:border-[#6f5430] hover:text-[#f4efe7]"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    Có ({review.helpfulCount})
                  </button>
                </div>
              </article>
            ))}

            {filteredReviews.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-[#3a2c1c] px-6 py-10 text-center text-[#8f8473]">
                Chưa có đánh giá phù hợp với bộ lọc này.
              </div>
            ) : null}
          </div>
        </section>
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
