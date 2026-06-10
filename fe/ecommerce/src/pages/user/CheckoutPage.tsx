import type { ReactNode } from 'react'
import {
  Banknote,
  Check,
  ChevronLeft,
  Circle,
  CreditCard,
  Landmark,
  LockKeyhole,
  MapPinHouse,
  Package,
  ShieldCheck,
  Smartphone,
  Tag,
  Truck,
  WalletCards,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Input } from '../../components/ui/input'
import { Select } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import { createProductImage } from '../../data/market'
import { cn } from '../../lib/utils'
import { useMarketStore } from '../../store/useMarketStore'

const FREE_SHIPPING_THRESHOLD = 500000
const STANDARD_SHIPPING_FEE = 30000

const cityOptions = ['TP. Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ']
const districtOptions = ['Quận 1', 'Quận 3', 'Quận Bình Thạnh', 'Thủ Đức']
const wardOptions = ['Phường Bến Nghé', 'Phường Võ Thị Sáu', 'Phường 25', 'Phường An Khánh']

const shippingMethods = [
  {
    id: 'standard',
    title: 'Tiêu chuẩn',
    description: 'Giao trong 3 - 5 ngày làm việc',
    note: 'Miễn phí cho đơn trên 500.000 đ',
    icon: Truck,
    fee: 0,
  },
  {
    id: 'express',
    title: 'Nhanh',
    description: 'Giao trong 1 - 2 ngày làm việc',
    note: 'Phù hợp khi cần nhận sớm',
    icon: Package,
    fee: 50000,
  },
  {
    id: 'priority',
    title: 'Hỏa tốc',
    description: 'Giao trong ngày trước 22:00',
    note: 'Chỉ áp dụng nội thành HCM và Hà Nội',
    icon: Zap,
    fee: 80000,
  },
] as const

const paymentMethods = [
  {
    id: 'cod',
    title: 'Thanh toán khi nhận hàng',
    description: 'Trả tiền mặt khi shipper giao',
    icon: Banknote,
  },
  {
    id: 'bank',
    title: 'Chuyển khoản ngân hàng',
    description: 'Chuyển khoản rồi upload bill',
    icon: Landmark,
  },
  {
    id: 'card',
    title: 'Thẻ tín dụng / ghi nợ',
    description: 'Visa, Mastercard, JCB',
    icon: CreditCard,
  },
  {
    id: 'momo',
    title: 'Ví MoMo',
    description: 'Quét QR hoặc nhập số điện thoại',
    icon: Smartphone,
  },
] as const

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function CheckoutStep({
  index,
  title,
  active,
  complete,
}: {
  index: number
  title: string
  active?: boolean
  complete?: boolean
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold transition',
          complete
            ? 'border-emerald-500/70 bg-emerald-500/12 text-emerald-400'
            : active
              ? 'border-[#f4ab22] bg-[#2a1d0d] text-[#f4ab22]'
              : 'border-[#3b3021] bg-transparent text-[#7c7165]',
        )}
      >
        {complete ? <Check className="h-4 w-4" /> : index}
      </span>
      <span
        className={cn(
          'text-[0.98rem] font-semibold',
          active ? 'text-[#f4ab22]' : complete ? 'text-emerald-400' : 'text-[#938674]',
        )}
      >
        {title}
      </span>
    </div>
  )
}

function SectionCard({
  step,
  title,
  children,
}: {
  step: number
  title: string
  children: ReactNode
}) {
  return (
    <section className="rounded-[30px] border border-[#312619] bg-[linear-gradient(180deg,#1a140f_0%,#18120e_100%)] p-6 shadow-[0_24px_50px_rgba(0,0,0,0.16)] sm:p-8">
      <div className="flex items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[#7a5318] bg-[#24180d] text-lg font-bold text-[#f4ab22]">
          {step}
        </span>
        <h2 className="text-[1.55rem] font-bold text-[#f7f1e7]">{title}</h2>
      </div>
      <div className="mt-7">{children}</div>
    </section>
  )
}

function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <label className="mb-2 block text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-[#87775f]">
      {children}
    </label>
  )
}

function MethodOption({
  selected,
  title,
  description,
  note,
  price,
  icon: Icon,
  onClick,
}: {
  selected: boolean
  title: string
  description: string
  note: string
  price: string
  icon: typeof Truck
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-start gap-4 rounded-[24px] border px-5 py-5 text-left transition',
        selected
          ? 'border-[#f4ab22] bg-[#2a1d0f] shadow-[0_0_0_1px_rgba(244,171,34,0.16)]'
          : 'border-[#3a2e22] bg-[#1b1510] hover:border-[#705229]',
      )}
    >
      <span
        className={cn(
          'mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-[#f4ab22] bg-[#f4ab22] text-[#1a120b]'
            : 'border-[#4b4032] text-transparent',
        )}
      >
        {selected ? <Circle className="h-3 w-3 fill-current" /> : <Circle className="h-3 w-3" />}
      </span>

      <span className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#120f0c] text-[#f4ab22]">
        <Icon className="h-5 w-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[1.25rem] font-bold text-[#f5efe5]">{title}</span>
        <span className="mt-1 block text-[1rem] text-[#9d907f]">{description}</span>
        <span className="mt-1 block text-[0.98rem] font-semibold text-[#cda04e]">{note}</span>
      </span>

      <span
        className={cn(
          'shrink-0 text-[1.15rem] font-extrabold',
          selected ? 'text-[#39d26d]' : 'text-[#f4efe5]',
        )}
      >
        {price}
      </span>
    </button>
  )
}

function PaymentOption({
  selected,
  title,
  description,
  icon: Icon,
  onClick,
}: {
  selected: boolean
  title: string
  description: string
  icon: typeof WalletCards
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-[22px] border px-5 py-5 text-left transition',
        selected
          ? 'border-[#f4ab22] bg-[#2a1d0f]'
          : 'border-[#3a2e22] bg-[#1b1510] hover:border-[#705229]',
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border',
          selected
            ? 'border-[#f4ab22] bg-[#f4ab22] text-[#1a120b]'
            : 'border-[#4b4032] text-transparent',
        )}
      >
        {selected ? <Circle className="h-3 w-3 fill-current" /> : <Circle className="h-3 w-3" />}
      </span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-[#120f0c] text-[#f4ab22]">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0">
        <span className="block text-[1.18rem] font-bold text-[#f5efe5]">{title}</span>
        <span className="mt-1 block text-[0.98rem] text-[#9d907f]">{description}</span>
      </span>
    </button>
  )
}

function CheckoutPage() {
  const cartItems = useMarketStore((state) => state.cartItems)
  const [promoCode, setPromoCode] = useState('')
  const [shippingMethod, setShippingMethod] = useState<
    (typeof shippingMethods)[number]['id']
  >('standard')
  const [paymentMethod, setPaymentMethod] = useState<
    (typeof paymentMethods)[number]['id']
  >('cod')
  const [saveAddress, setSaveAddress] = useState(true)
  const [acceptTerms, setAcceptTerms] = useState(true)

  const subtotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cartItems],
  )
  const itemCount = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  )

  const selectedShipping =
    shippingMethods.find((item) => item.id === shippingMethod) ?? shippingMethods[0]
  const shippingFee =
    cartItems.length === 0
      ? 0
      : selectedShipping.id === 'standard'
        ? subtotal >= FREE_SHIPPING_THRESHOLD
          ? 0
          : STANDARD_SHIPPING_FEE
        : selectedShipping.fee
  const total = subtotal + shippingFee

  return (
    <section className="min-h-[calc(100svh-76px)] border-x border-[#221a10] bg-[#0c0907] px-5 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1440px]">
        <div className="rounded-[28px] border border-[#241b12] bg-[#120d0a] px-5 py-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)] sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <Link
              to="/cart"
              className="inline-flex items-center gap-2 text-[1rem] font-medium text-[#f4ab22] transition hover:text-[#ffd088]"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại giỏ hàng
            </Link>

            <div className="flex flex-wrap items-center gap-3 sm:gap-5">
              <CheckoutStep index={1} title="Giỏ hàng" complete />
              <div className="hidden h-px w-10 bg-[#3d3122] sm:block" />
              <CheckoutStep index={2} title="Thanh toán" active />
              <div className="hidden h-px w-10 bg-[#3d3122] sm:block" />
              <CheckoutStep index={3} title="Xác nhận" />
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="space-y-6">
            <SectionCard step={1} title="Thông tin người nhận">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel>Họ và tên *</FieldLabel>
                  <Input
                    defaultValue="Nguyễn Văn A"
                    className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]"
                  />
                </div>
                <div>
                  <FieldLabel>Số điện thoại *</FieldLabel>
                  <Input
                    defaultValue="0901 234 567"
                    className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]"
                  />
                </div>
                <div className="md:col-span-2">
                  <FieldLabel>Email *</FieldLabel>
                  <Input
                    defaultValue="ten@email.com"
                    className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]"
                  />
                </div>
              </div>
            </SectionCard>

            <SectionCard step={2} title="Địa chỉ giao hàng">
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <FieldLabel>Tỉnh / thành phố *</FieldLabel>
                  <Select className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]">
                    {cityOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Quận / huyện *</FieldLabel>
                  <Select className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]">
                    {districtOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Phường / xã *</FieldLabel>
                  <Select className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]">
                    {wardOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <FieldLabel>Số nhà, tên đường *</FieldLabel>
                  <Input
                    defaultValue="123 Nguyễn Trãi"
                    className="h-14 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1.02rem]"
                  />
                </div>
              </div>

              <label className="mt-6 inline-flex items-center gap-3 text-[0.98rem] text-[#a59884]">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(event) => setSaveAddress(event.target.checked)}
                  className="h-4 w-4 rounded border-[#5e4e35] bg-[#120f0c] accent-[#f4ab22]"
                />
                Lưu địa chỉ này cho lần sau
              </label>
            </SectionCard>

            <SectionCard step={3} title="Phương thức vận chuyển">
              <div className="space-y-4">
                {shippingMethods.map((method) => (
                  <MethodOption
                    key={method.id}
                    selected={shippingMethod === method.id}
                    title={method.title}
                    description={method.description}
                    note={method.note}
                    price={
                      method.id === 'standard' && subtotal >= FREE_SHIPPING_THRESHOLD
                        ? 'MIỄN PHÍ'
                        : method.fee === 0
                          ? 'MIỄN PHÍ'
                          : formatCurrency(method.fee)
                    }
                    icon={method.icon}
                    onClick={() => setShippingMethod(method.id)}
                  />
                ))}
              </div>
            </SectionCard>

            <SectionCard step={4} title="Phương thức thanh toán">
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <PaymentOption
                    key={method.id}
                    selected={paymentMethod === method.id}
                    title={method.title}
                    description={method.description}
                    icon={method.icon}
                    onClick={() => setPaymentMethod(method.id)}
                  />
                ))}
              </div>

              {paymentMethod === 'cod' ? (
                <div className="mt-4 rounded-[22px] border border-[#724a17] bg-[#2b2013] px-5 py-4 text-[1rem] leading-7 text-[#b8aa93]">
                  <span className="font-semibold text-[#f4ab22]">Lưu ý:</span> Bạn sẽ thanh toán
                  cho shipper khi nhận hàng. Vui lòng chuẩn bị đúng số tiền{' '}
                  <span className="font-bold text-[#ffb43a]">{formatCurrency(total)}</span>.
                </div>
              ) : null}
            </SectionCard>

            <SectionCard step={5} title="Ghi chú đơn hàng (tùy chọn)">
              <Textarea
                placeholder="Ghi chú cho shipper, yêu cầu đóng gói, khung giờ giao..."
                className="min-h-[132px] rounded-[18px] border-[#6c4918] bg-[#12100d] px-5 py-4 text-[1rem] leading-7 placeholder:text-[#7f7469]"
              />
            </SectionCard>

            <div className="rounded-[30px] border border-transparent bg-[radial-gradient(circle_at_top,rgba(255,152,30,0.18),transparent_42%),linear-gradient(180deg,#17110d_0%,#120d0a_100%)] px-6 py-6 shadow-[0_26px_60px_rgba(0,0,0,0.22)]">
              <label className="flex items-start gap-3 text-[1rem] leading-8 text-[#aa9c88]">
                <input
                  type="checkbox"
                  checked={acceptTerms}
                  onChange={(event) => setAcceptTerms(event.target.checked)}
                  className="mt-2 h-4 w-4 rounded border-[#5e4e35] bg-[#120f0c] accent-[#f4ab22]"
                />
                <span>
                  Tôi đã đọc và đồng ý với{' '}
                  <span className="font-semibold text-[#f4ab22]">Điều khoản dịch vụ</span> và{' '}
                  <span className="font-semibold text-[#f4ab22]">Chính sách bảo mật</span> của E
                  SHOP.
                </span>
              </label>

              <button
                type="button"
                disabled={!acceptTerms || cartItems.length === 0}
                className="mt-6 inline-flex h-[72px] w-full items-center justify-center gap-3 rounded-[20px] bg-[linear-gradient(90deg,#ff6600_0%,#ff9f1c_100%)] px-6 text-[1.3rem] font-extrabold text-white shadow-[0_22px_44px_rgba(255,120,20,0.24)] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:brightness-100"
              >
                <LockKeyhole className="h-5 w-5" />
                Đặt hàng · {formatCurrency(total)}
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-[0.94rem] text-[#847a6f]">
                <ShieldCheck className="h-4 w-4" />
                Thanh toán được mã hóa SSL 256-bit
              </div>
            </div>
          </div>

          <aside className="space-y-5 xl:sticky xl:top-[96px] xl:self-start">
            <div className="overflow-hidden rounded-[30px] border border-[#312619] bg-[linear-gradient(180deg,#1a140f_0%,#17120e_100%)] shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
              <div className="flex items-center justify-between border-b border-[#2e2419] px-6 py-5">
                <h2 className="text-[1.65rem] font-bold text-[#f4efe6]">Đơn hàng</h2>
                <p className="text-[1rem] text-[#7d7268]">{itemCount} sản phẩm</p>
              </div>

              <div>
                {cartItems.map((item) => {
                  const image = item.image || createProductImage(item.category)
                  const lineTotal = item.unitPrice * item.quantity

                  return (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-[#2e2419] px-6 py-5 last:border-b-0"
                    >
                      <div className="h-[76px] w-[72px] shrink-0 overflow-hidden rounded-[16px] bg-[#100d0a]">
                        <img
                          src={image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="truncate text-[1.02rem] font-bold text-[#f0e8db]">
                              {item.name}
                            </p>
                            <p className="mt-1 text-[0.96rem] text-[#857a70]">
                              {item.color.name} · {item.size} · x{item.quantity}
                            </p>
                          </div>
                          <p className="shrink-0 text-[1.05rem] font-extrabold text-[#f4ab22]">
                            {formatCurrency(lineTotal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#312619] bg-[linear-gradient(180deg,#1a140f_0%,#17120e_100%)] px-6 py-5 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
              <div className="flex items-center gap-3">
                <Tag className="h-5 w-5 text-[#f4efe6]" />
                <h2 className="text-[1.2rem] font-bold text-[#f4efe6]">Mã giảm giá</h2>
              </div>

              <form className="mt-4 flex gap-3" onSubmit={(event) => event.preventDefault()}>
                <Input
                  value={promoCode}
                  onChange={(event) => setPromoCode(event.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="h-13 rounded-[16px] border-[#3a2f23] bg-[#12100d] px-4 text-[1rem]"
                />
                <button
                  type="submit"
                  className="inline-flex h-13 shrink-0 items-center justify-center rounded-[16px] border border-[#443729] px-5 text-[1rem] font-bold text-[#f4efe6] transition hover:border-[#7b5c2b] hover:text-[#f4ab22]"
                >
                  Áp dụng
                </button>
              </form>

              <p className="mt-3 text-[0.92rem] text-[#756b61]">
                Thử: ESHOP10 · FASHION20 · NEWUSER15
              </p>
            </div>

            <div className="rounded-[30px] border border-[#312619] bg-[linear-gradient(180deg,#1a140f_0%,#17120e_100%)] px-6 py-6 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
              <div className="space-y-3 text-[1.02rem]">
                <div className="flex items-center justify-between gap-4 text-[#9e9180]">
                  <span>Tạm tính</span>
                  <span className="font-semibold text-[#f4efe6]">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-[#9e9180]">
                  <span>Vận chuyển ({selectedShipping.title})</span>
                  <span className="font-bold text-[#39d26d]">
                    {shippingFee === 0 ? 'MIỄN PHÍ' : formatCurrency(shippingFee)}
                  </span>
                </div>
              </div>

              <div className="mt-6 border-t border-[#2f2419] pt-6">
                <div className="flex items-end justify-between gap-4">
                  <span className="text-[1.18rem] font-bold text-[#f4efe6]">Tổng cộng</span>
                  <span className="font-display text-[2.25rem] font-bold leading-none tracking-[-0.04em] text-[#ff9f1c]">
                    {formatCurrency(total)}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] border border-[#312619] bg-[linear-gradient(180deg,#1a140f_0%,#17120e_100%)] px-6 py-5 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-[#9f9386]">
                  <LockKeyhole className="h-4.5 w-4.5 text-[#f4ab22]" />
                  <span>Bảo mật SSL 256-bit</span>
                </div>
                <div className="flex items-center gap-3 text-[#9f9386]">
                  <MapPinHouse className="h-4.5 w-4.5 text-[#60a5fa]" />
                  <span>Đổi trả miễn phí trong 30 ngày</span>
                </div>
                <div className="flex items-center gap-3 text-[#9f9386]">
                  <ShieldCheck className="h-4.5 w-4.5 text-[#4ade80]" />
                  <span>Hàng chính hãng, bảo đảm</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  )
}

export default CheckoutPage
