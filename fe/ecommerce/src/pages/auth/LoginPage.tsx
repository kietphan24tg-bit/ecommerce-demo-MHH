import {
  ArrowRight,
  Eye,
  LockKeyhole,
  Mail,
  PackageCheck,
  ShieldCheck,
  Smartphone,
  Truck,
  Undo2,
} from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { cn } from '../../lib/utils'

const signInModes = [
  { id: 'email', label: 'Email' },
  { id: 'phone', label: 'Số điện thoại' },
] as const

const trustPoints = [
  {
    icon: PackageCheck,
    title: '10.000+ sản phẩm',
    description: 'Cập nhật xu hướng mới mỗi tuần',
  },
  {
    icon: Truck,
    title: 'Giao hàng miễn phí',
    description: 'Cho đơn từ 500.000 đ',
  },
  {
    icon: Undo2,
    title: 'Đổi trả 30 ngày',
    description: 'Miễn phí đổi size, hoàn tiền 100%',
  },
  {
    icon: ShieldCheck,
    title: 'Thanh toán bảo mật',
    description: 'Mã hóa SSL, 5 phương thức linh hoạt',
  },
] as const

function BrandLockup() {
  return (
    <Link to="/" className="flex items-center gap-4 transition hover:opacity-95">
      <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] bg-[#ff9f1a] shadow-[0_18px_40px_-18px_rgba(255,159,26,0.85)]">
        <span className="font-display text-[1.9rem] font-bold leading-none text-white">E</span>
      </div>

      <div>
        <p className="font-display text-[2rem] font-bold leading-none tracking-[0.12em] text-white">
          SHOP
        </p>
        <p className="mt-2 text-[0.72rem] font-medium uppercase tracking-[0.55em] text-[#796b58]">
          Fashion Store
        </p>
      </div>
    </Link>
  )
}

function SocialMark({ provider }: { provider: 'google' | 'facebook' }) {
  if (provider === 'google') {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white text-[0.95rem] font-black text-[#17120d]"
      >
        <span className="bg-[conic-gradient(from_90deg,#4285F4_0_25%,#34A853_25%_50%,#FBBC05_50%_75%,#EA4335_75%_100%)] bg-clip-text text-transparent">
          G
        </span>
      </span>
    )
  }

  return (
    <span
      aria-hidden="true"
      className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#1877f2] text-sm font-black text-white"
    >
      f
    </span>
  )
}

function LoginPage() {
  const [signInMode, setSignInMode] = useState<(typeof signInModes)[number]['id']>('email')

  return (
    <section className="min-h-screen bg-[#090603] px-4 py-4 text-[#f8f2e7] sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-2rem)] max-w-[1440px] overflow-hidden rounded-[28px] border border-[#2f2418] bg-[#0c0907] shadow-[0_32px_90px_-48px_rgba(0,0,0,0.95)]">
        <div className="relative hidden w-[43%] shrink-0 overflow-hidden border-r border-[#2a2118] lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,158,27,0.16),transparent_34%),radial-gradient(circle_at_bottom_left,rgba(255,158,27,0.1),transparent_28%)]" />
          <div className="relative flex h-full flex-col px-10 py-14 xl:px-14">
            <BrandLockup />

            <div className="mt-24 max-w-[26rem]">
              <h1 className="font-display text-5xl font-bold leading-[1.08] tracking-[-0.05em] text-white">
                Thời trang <span className="text-[#ffad29]">đỉnh cao</span>
                <br />
                tại E SHOP
              </h1>
              <p className="mt-8 max-w-[24rem] text-[1.35rem] leading-8 text-[#94826d]">
                Hàng ngàn sản phẩm chính hãng, giao hàng nhanh, đổi trả 30 ngày, tất cả
                trong một nền tảng.
              </p>
            </div>

            <div className="mt-14 space-y-5">
              {trustPoints.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl border border-[#4a3214] bg-[#1d140c] text-[#ffad29] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[1.35rem] font-semibold leading-7 text-white">{title}</p>
                    <p className="mt-1 text-lg leading-7 text-[#877663]">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-auto pt-12 text-base text-[#7f715f]">
              © 2025 E SHOP Fashion Store · Tất cả quyền được bảo lưu
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
          <div className="w-full max-w-[36rem]">
            <div className="lg:hidden">
              <BrandLockup />
            </div>

            <div className="mt-10 lg:mt-0">
              <h2 className="font-display text-[2.5rem] font-bold tracking-[-0.04em] text-white sm:text-[3rem]">
                Chào mừng trở lại
              </h2>
              <p className="mt-3 text-lg text-[#8d7d69] sm:text-[1.32rem]">
                Đăng nhập để tiếp tục mua sắm
              </p>
            </div>

            <div className="mt-10 grid grid-cols-2 rounded-[18px] bg-[#221b15] p-1.5">
              {signInModes.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setSignInMode(mode.id)}
                  className={cn(
                    'min-h-[52px] rounded-[14px] px-4 text-base font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c0907]',
                    signInMode === mode.id
                      ? 'bg-[#17120d] text-white shadow-[0_10px_26px_-18px_rgba(0,0,0,0.9)]'
                      : 'text-[#8a7a67] hover:text-[#f1e7d6]',
                  )}
                  aria-pressed={signInMode === mode.id}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            <form className="mt-8 space-y-6" onSubmit={(event) => event.preventDefault()}>
              <div className="space-y-2.5">
                <label htmlFor="email" className="meta-label block">
                  {signInMode === 'email' ? 'Email' : 'Số điện thoại'}{' '}
                  <span className="text-[#ff7a59]">*</span>
                </label>
                <div className="relative">
                  {signInMode === 'email' ? (
                    <div className="pointer-events-none absolute top-2 bottom-2 left-2 z-10 flex w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                  ) : (
                    <div className="pointer-events-none absolute top-2 bottom-2 left-2 z-10 flex w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                      <Smartphone className="h-4.5 w-4.5" />
                    </div>
                  )}
                  <Input
                    id="email"
                    type={signInMode === 'email' ? 'email' : 'tel'}
                    placeholder={signInMode === 'email' ? 'ten@email.com' : 'Nhập số điện thoại'}
                    className="h-14 rounded-2xl border-[#3b3126] bg-[#0f0f10] pl-20 pr-4 text-[1.05rem] text-[#edf3fb] placeholder:text-[#728199] focus:border-[#8b6f38] focus:bg-[#121214]"
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label htmlFor="password" className="meta-label block">
                  Mật khẩu <span className="text-[#ff7a59]">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute top-2 bottom-2 left-2 z-10 flex w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
                    <LockKeyhole className="h-4.5 w-4.5" />
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nhập mật khẩu"
                    className="h-14 rounded-2xl border-[#3b3126] bg-[#0f0f10] pl-20 pr-20 text-[1.05rem] text-[#edf3fb] placeholder:text-[#728199] focus:border-[#8b6f38] focus:bg-[#121214]"
                  />
                  <button
                    type="button"
                    aria-label="Hiển thị mật khẩu"
                    className="absolute top-2 right-2 z-10 flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#332718] bg-[#16110c] text-[#b59669] transition hover:text-[#f4ead4] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                  >
                    <Eye className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-3 text-base text-[#92816f] sm:flex-row sm:items-center sm:justify-between">
                <label className="inline-flex min-h-11 items-center gap-3">
                  <input
                    type="checkbox"
                    className="h-4.5 w-4.5 rounded border border-[#5c4a33] bg-transparent accent-[#ff9419]"
                  />
                  <span>Ghi nhớ đăng nhập</span>
                </label>
                <Link
                  to="/forgot-password"
                  className="font-semibold text-[#ff991b] transition hover:text-[#ffb347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
                >
                  Quên mật khẩu?
                </Link>
              </div>

              <Button
                type="submit"
                className="h-15 w-full rounded-[18px] text-lg font-bold shadow-[0_22px_48px_-24px_rgba(255,145,0,0.95)]"
              >
                Đăng nhập
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

            <div className="my-8 flex items-center gap-4 text-sm text-[#786a59]">
              <div className="h-px flex-1 bg-[#2f2418]" />
              <span>hoặc</span>
              <div className="h-px flex-1 bg-[#2f2418]" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                className="flex min-h-14 items-center justify-center gap-3 rounded-[18px] border border-[#3a3025] bg-transparent px-4 text-base font-semibold text-white transition hover:border-[#7a6130] hover:bg-[#15110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
              >
                <SocialMark provider="google" />
                đăng nhập với Google
              </button>
              <button
                type="button"
                className="flex min-h-14 items-center justify-center gap-3 rounded-[18px] border border-[#3a3025] bg-transparent px-4 text-base font-semibold text-white transition hover:border-[#7a6130] hover:bg-[#15110d] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
              >
                <SocialMark provider="facebook" />
                đăng nhập với Facebook
              </button>
            </div>

            <p className="mt-10 text-center text-lg text-[#8e7d69]">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="font-semibold text-[#ff991b] transition hover:text-[#ffb347] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ffad29]"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LoginPage
