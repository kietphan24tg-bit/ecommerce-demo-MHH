import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Heart,
  LockKeyhole,
  Minus,
  Plus,
  RefreshCcw,
  Shield,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { createProductImage } from '../../data/market'
import { useMarketStore } from '../../store/useMarketStore'
import type { CartItem } from '../../types/product'

const FREE_SHIPPING_THRESHOLD = 500000
const STANDARD_SHIPPING_FEE = 30000
const CART_ITEMS_PER_PAGE = 4

type PaginationItem = number | '...'

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

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim()
}

function getCategoryLabel(category: string) {
  const normalized = normalizeText(category)

  if (normalized.includes('ao')) {
    return 'Áo'
  }

  if (normalized.includes('quan')) {
    return 'Quần'
  }

  if (normalized.includes('giay')) {
    return 'Giày'
  }

  if (normalized.includes('dep')) {
    return 'Dép'
  }

  if (normalized.includes('tui')) {
    return 'Túi'
  }

  return category
}

function CartLineItem({
  item,
  onDecrease,
  onIncrease,
  onRemove,
  onToggleSaved,
}: {
  item: CartItem
  onDecrease: () => void
  onIncrease: () => void
  onRemove: () => void
  onToggleSaved: () => void
}) {
  const lineTotal = item.unitPrice * item.quantity
  const [imageFailed, setImageFailed] = useState(false)
  const displayImage = imageFailed ? createProductImage(item.category) : item.image

  return (
    <article className="border-b border-[#33291e] px-6 py-5 last:border-b-0 lg:px-7">
      <div className="flex gap-5">
        <div className="h-[116px] w-[98px] shrink-0 overflow-hidden rounded-[15px] bg-[#302820] lg:h-[122px] lg:w-[104px]">
          <img
            src={displayImage}
            alt={item.name}
            className="h-full w-full object-cover object-center opacity-90"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-5 md:flex-row md:justify-between">
            <div className="min-w-0">
              <p className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-[#8d7b64]">
                {getCategoryLabel(item.category)}
              </p>
              <h3 className="mt-2 text-[0.95rem] font-bold leading-[1.32] text-[#f5efe6] md:text-[1.06rem]">
                {item.name}
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex h-8 items-center gap-2 rounded-[10px] border border-[#43382c] bg-[#201a14] px-3 text-[0.9rem] text-[#9b8a74]">
                  <span
                    className="h-3 w-3 rounded-full border border-white/10"
                    style={{ backgroundColor: item.color.hex }}
                  />
                  {item.color.name}
                </span>
                <span className="inline-flex h-8 items-center rounded-[10px] border border-[#43382c] bg-[#201a14] px-3 text-[0.9rem] text-[#9b8a74]">
                  {item.size}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="inline-flex h-11 items-center overflow-hidden rounded-[11px] border border-[#45392d] bg-[#17120d]">
                  <button
                    type="button"
                    onClick={onDecrease}
                    aria-label={`Giam so luong ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center text-[#f4ebdb] transition hover:bg-white/5"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="flex h-11 min-w-12 items-center justify-center border-x border-[#45392d] text-[0.98rem] font-semibold text-white">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={onIncrease}
                    aria-label={`Tang so luong ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center text-[#f4ebdb] transition hover:bg-white/5"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onRemove}
                  className="inline-flex h-11 items-center gap-2 rounded-[11px] border border-[#43382c] bg-[#1a1510] px-4 text-[0.92rem] text-[#8f816d] transition hover:border-[#6f5534] hover:text-[#f3ead9]"
                >
                  <Trash2 className="h-4 w-4" />
                  Xóa
                </button>

                <button
                  type="button"
                  onClick={onToggleSaved}
                  className={`inline-flex h-11 items-center gap-2 rounded-[11px] border px-4 text-[0.92rem] transition ${
                    item.saved
                      ? 'border-[#6f5534] bg-[#1d1710] text-[#f4b321]'
                      : 'border-[#43382c] bg-[#1a1510] text-[#8f816d] hover:border-[#6f5534] hover:text-[#f3ead9]'
                  }`}
                >
                  <Heart className={`h-4 w-4 ${item.saved ? 'fill-current' : ''}`} />
                  Lưu
                </button>
              </div>
            </div>

            <div className="shrink-0 pt-1 text-left md:w-[142px] md:text-right">
              <p className="font-display text-[1.04rem] font-bold leading-none tracking-[-0.03em] text-[#ff9f1c] md:text-[1.18rem]">
                {formatCurrency(lineTotal)}
              </p>
              <p className="mt-3 text-[0.9rem] text-[#8f816d]">{formatCurrency(item.unitPrice)} / cái</p>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function BenefitRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Truck
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[12px] border border-[#6a4916] bg-[#2a1d10] text-[#f4a41d]">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <div>
        <p className="text-[0.94rem] font-bold text-[#f4efe6]">{title}</p>
        <p className="mt-1 text-[0.9rem] text-[#7f7367]">{description}</p>
      </div>
    </div>
  )
}

function CartEmptyState() {
  return (
    <div className="relative overflow-hidden rounded-[32px] border border-[#342a1f] bg-[radial-gradient(circle_at_top_left,rgba(255,170,39,0.16),transparent_32%),linear-gradient(180deg,#1b140e_0%,#120d09_100%)] px-6 py-8 shadow-[0_24px_48px_rgba(0,0,0,0.24)] sm:px-8 sm:py-10 lg:px-10 lg:py-12">
      <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#f3b232]/10 blur-3xl" />

      <div className="relative max-w-[620px]">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[20px] border border-[#6b4a16] bg-[#22170d] text-[#f4b321] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <ShoppingBag className="h-7 w-7" strokeWidth={2.1} />
        </div>

        <p className="mt-6 text-[0.74rem] font-semibold uppercase tracking-[0.32em] text-[#a88e63]">
          Giỏ hàng trống
        </p>
        <h2 className="mt-3 max-w-[11ch] font-display text-[2rem] font-bold leading-[0.95] tracking-[-0.05em] text-[#f8f2e9] sm:text-[2.5rem]">
          Chọn món mới cho tủ đồ của bạn
        </h2>
        <p className="mt-4 max-w-[540px] text-[0.98rem] leading-7 text-[#9e8f7e]">
          Chưa có sản phẩm nào trong giỏ. Khám phá bộ sưu tập đang mở bán để thêm áo,
          quần, giày và phụ kiện trước khi thanh toán.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <span className="inline-flex items-center rounded-full border border-[#4b3926] bg-[#18110c] px-4 py-2 text-[0.88rem] text-[#dec9aa]">
            Miễn phí vận chuyển từ 500.000 đ
          </span>
          <span className="inline-flex items-center rounded-full border border-[#4b3926] bg-[#18110c] px-4 py-2 text-[0.88rem] text-[#dec9aa]">
            Đổi trả trong 30 ngày
          </span>
          <span className="inline-flex items-center rounded-full border border-[#4b3926] bg-[#18110c] px-4 py-2 text-[0.88rem] text-[#dec9aa]">
            Hàng chính hãng bảo hành 6 tháng
          </span>
        </div>

        <div className="mt-9 flex flex-wrap items-center gap-4">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(90deg,#ff5b05_0%,#ff9f1c_100%)] px-6 text-[0.94rem] font-bold text-white shadow-[0_16px_32px_rgba(255,133,20,0.24)] transition hover:brightness-105"
          >
            Khám phá sản phẩm
            <ArrowRight className="h-4 w-4" />
          </Link>

          <span className="text-[0.92rem] text-[#7f7263]">
            Thêm sản phẩm để xem tổng tiền và áp dụng mã giảm giá.
          </span>
        </div>
      </div>
    </div>
  )
}

function CartPage() {
  const cartItems = useMarketStore((state) => state.cartItems)
  const updateCartItemQuantity = useMarketStore((state) => state.updateCartItemQuantity)
  const removeCartItem = useMarketStore((state) => state.removeCartItem)
  const toggleSavedCartItem = useMarketStore((state) => state.toggleSavedCartItem)
  const [promoCode, setPromoCode] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )
  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cartItems],
  )
  const totalPages = Math.max(1, Math.ceil(cartItems.length / CART_ITEMS_PER_PAGE))
  const paginatedCartItems = useMemo(() => {
    const startIndex = (currentPage - 1) * CART_ITEMS_PER_PAGE
    return cartItems.slice(startIndex, startIndex + CART_ITEMS_PER_PAGE)
  }, [cartItems, currentPage])
  const paginationItems = useMemo(
    () => buildPagination(currentPage, totalPages),
    [currentPage, totalPages],
  )

  const isCartEmpty = cartItems.length === 0
  const shippingFee = isCartEmpty ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE
  const total = subtotal + shippingFee

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages))
  }, [totalPages])

  return (
    <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#0b0806] px-5 py-7 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <nav className="flex flex-wrap items-center gap-2 text-[1rem] text-[#877a6c]">
          <Link to="/" className="transition hover:text-[#f4e9d8]">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="font-semibold text-[#f4efe6]">Giỏ hàng</span>
        </nav>

        <div className="mt-10 flex flex-wrap items-end gap-4">
          <h1 className="font-display text-[1.95rem] font-bold leading-none tracking-[-0.05em] text-[#f8f3ec] sm:text-[2.05rem]">
            Giỏ hàng
          </h1>
          <p className="pb-1 text-[0.94rem] text-[#8d8276]">{itemCount} sản phẩm</p>
        </div>

        <div className="mt-9 flex flex-col gap-6 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1 xl:max-w-[930px]">
            {isCartEmpty ? (
              <CartEmptyState />
            ) : (
              <>
                <div className="overflow-hidden rounded-[28px] border border-[#342a1f] bg-[#1d1712] shadow-[0_18px_32px_rgba(0,0,0,0.16)]">
                  {paginatedCartItems.map((item) => (
                    <CartLineItem
                      key={item.id}
                      item={item}
                      onDecrease={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                      onIncrease={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                      onRemove={() => removeCartItem(item.id)}
                      onToggleSaved={() => toggleSavedCartItem(item.id)}
                    />
                  ))}
                </div>

                {cartItems.length > CART_ITEMS_PER_PAGE ? (
                  <div className="mt-6 flex flex-col gap-4 border-t border-[#221a10] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-[#8f8578]">
                      Hiển thị {(currentPage - 1) * CART_ITEMS_PER_PAGE + 1}-
                      {Math.min(currentPage * CART_ITEMS_PER_PAGE, cartItems.length)} /{' '}
                      {cartItems.length} dòng sản phẩm
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
              </>
            )}

            <div className="mt-5">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-[0.96rem] font-medium text-[#796d60] transition hover:text-[#f4b321]"
              >
                <ChevronLeft className="h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>

          <aside className="w-full shrink-0 space-y-5 lg:w-[410px] lg:sticky lg:top-[96px]">
            <div className="overflow-hidden rounded-[28px] border border-[#342a1f] bg-[#1d1712] shadow-[0_18px_32px_rgba(0,0,0,0.16)]">
              <div className="border-b border-[#31261b] px-6 py-6">
                <h2 className="text-[1.04rem] font-bold text-[#f4efe6]">Tóm tắt đơn hàng</h2>
              </div>

              <div className="px-6 py-6">
                <div className="space-y-3 text-[0.95rem]">
                  <div className="flex items-center justify-between gap-4 text-[#85796d]">
                    <span>Tạm tính ({itemCount} sản phẩm)</span>
                    <span className="font-semibold text-[#ece3d7]">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 text-[#85796d]">
                    <span>Phí vận chuyển</span>
                    <span className="font-bold text-[#22d365]">
                      {shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 border-t border-[#31261b] pt-6">
                  <div className="flex items-end justify-between gap-4">
                    <span className="text-[0.98rem] font-bold text-[#f4efe6]">Tổng cộng</span>
                    <span className="font-display text-[1.82rem] font-bold leading-none tracking-[-0.04em] text-[#ff9f1c]">
                      {formatCurrency(total)}
                    </span>
                  </div>

                  {isCartEmpty ? (
                    <button
                      type="button"
                      disabled
                      className="mt-7 inline-flex h-[58px] w-full items-center justify-center rounded-[16px] bg-[linear-gradient(90deg,#ff5b05_0%,#ff9f1c_100%)] px-6 text-[0.98rem] font-extrabold uppercase tracking-[0.04em] text-white shadow-[0_16px_32px_rgba(255,133,20,0.28)] opacity-45"
                    >
                      TIẾN HÀNH THANH TOÁN →
                    </button>
                  ) : (
                    <Link
                      to="/checkout"
                      className="mt-7 inline-flex h-[58px] w-full items-center justify-center rounded-[16px] bg-[linear-gradient(90deg,#ff5b05_0%,#ff9f1c_100%)] px-6 text-[0.98rem] font-extrabold uppercase tracking-[0.04em] text-white shadow-[0_16px_32px_rgba(255,133,20,0.28)] transition hover:brightness-105"
                    >
                      TIẾN HÀNH THANH TOÁN →
                    </Link>
                  )}

                  <div className="mt-4 flex items-center justify-center gap-2 text-[0.86rem] text-[#756b61]">
                    <LockKeyhole className="h-4 w-4" />
                    Thanh toán bảo mật SSL
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-[#342a1f] bg-[#1d1712] px-6 py-6 shadow-[0_18px_32px_rgba(0,0,0,0.16)]">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-[#f0e4d2]" />
                <h2 className="text-[1rem] font-bold text-[#f4efe6]">Mã giảm giá</h2>
              </div>

              <form className="mt-5 flex gap-3" onSubmit={(event) => event.preventDefault()}>
                <input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  disabled={isCartEmpty}
                  placeholder="Nhập mã giảm giá"
                  className="h-12 min-w-0 flex-1 rounded-[12px] border border-[#403427] bg-[#14110e] px-4 text-[0.96rem] text-[#f4efe6] outline-none transition placeholder:text-[#776c60] focus:border-[#7b5d28] disabled:cursor-not-allowed disabled:opacity-45"
                />
                <button
                  type="submit"
                  disabled={isCartEmpty}
                  className="inline-flex h-12 shrink-0 items-center justify-center rounded-[12px] border border-[#45382a] px-5 text-[0.96rem] font-bold text-[#f4efe6] transition hover:border-[#7b5d28] hover:text-[#f4b321] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-[#45382a] disabled:hover:text-[#f4efe6]"
                >
                  Áp dụng
                </button>
              </form>

              {isCartEmpty ? (
                <p className="mt-3 text-[0.88rem] leading-6 text-[#776c60]">
                  Thêm ít nhất một sản phẩm vào giỏ để sử dụng ưu đãi.
                </p>
              ) : null}

            </div>

            <div className="rounded-[28px] border border-[#342a1f] bg-[#1d1712] px-6 py-6 shadow-[0_18px_32px_rgba(0,0,0,0.16)]">
              <div className="space-y-5">
                <BenefitRow
                  icon={Truck}
                  title="Miễn phí vận chuyển"
                  description="Đơn từ 500.000 đ"
                />
                <BenefitRow
                  icon={RefreshCcw}
                  title="Đổi trả 30 ngày"
                  description="Miễn phí đổi size"
                />
                <BenefitRow
                  icon={Shield}
                  title="Hàng chính hãng"
                  description="Bảo hành 6 tháng"
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CartPage
