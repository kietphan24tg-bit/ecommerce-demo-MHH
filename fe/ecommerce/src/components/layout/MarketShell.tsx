import {
  Heart,
  LayoutDashboard,
  Package2,
  ShieldHalf,
  ShoppingCart,
  UserRound,
} from 'lucide-react'
import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useMarketStore } from '../../store/useMarketStore'

type MarketShellProps = {
  area: 'user' | 'admin'
}

function BrandLockup() {
  return (
    <Link to="/" className="flex items-center gap-3 transition hover:opacity-95">
      <div className="relative flex h-[48px] w-[54px] shrink-0 items-center justify-center overflow-hidden rounded-r-[12px] rounded-l-[4px] bg-[#f4b321] shadow-[0_8px_22px_rgba(244,171,34,0.16)]">
        <div className="absolute inset-y-0 left-0 w-2.5 bg-[#cc920f]" />
        <div className="absolute inset-y-0 left-2.5 w-[3px] bg-black/12" />
        <span className="relative pl-1.5 font-sans text-[1.75rem] font-black leading-none tracking-[-0.08em] text-[#151515]">
          E
        </span>
      </div>

      <div className="flex flex-col justify-center">
        <p className="font-sans text-[1.7rem] font-extrabold leading-none tracking-[0.2em] text-[#f5f5f2] sm:text-[1.82rem]">
          SHOP
        </p>
        <p className="mt-1.5 pl-[2px] font-sans text-[0.6rem] font-medium uppercase leading-none tracking-[0.42em] text-[#f4b321] sm:text-[0.64rem]">
          Fashion Store
        </p>
      </div>
    </Link>
  )
}

const userLinks: { to: string; label: string; icon: typeof Package2 }[] = []

const adminLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/category', label: 'Category', icon: ShieldHalf },
  { to: '/admin/product', label: 'Product', icon: Package2 },
]

function IconBadgeLink({
  to,
  label,
  count,
  icon: Icon,
}: {
  to: string
  label: string
  count: number
  icon: typeof Heart
}) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        cn(
          'relative flex h-11 w-11 items-center justify-center rounded-full border bg-[#18120d] transition',
          isActive
            ? 'border-[#8b6f38] text-[#f4ab22]'
            : 'border-[#3a2e1d] text-[#d8c9ae] hover:border-[#8b6f38] hover:text-[#f4ab22]',
        )
      }
    >
      <span className="absolute -right-0.5 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#f4ab22] px-1 text-[0.68rem] font-black leading-none text-[#17120d]">
        {count}
      </span>
      <Icon className="h-4.5 w-4.5" />
    </NavLink>
  )
}

export function MarketShell({ area }: MarketShellProps) {
  const products = useMarketStore((state) => state.products)
  const cartItems = useMarketStore((state) => state.cartItems)
  const savedItems = useMarketStore((state) => state.savedItems)
  const initializeCountryOptions = useMarketStore(
    (state) => state.initializeCountryOptions,
  )
  const links = area === 'admin' ? adminLinks : userLinks
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0)
  const savedCount = savedItems.length

  useEffect(() => {
    void initializeCountryOptions()
  }, [initializeCountryOptions])

  return (
    <div className="min-h-screen bg-[#0b0907] text-[#f4ead4]">
      <header className="sticky top-0 z-40 border-b border-[#2a2114] bg-[#15110d]/96 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
          <BrandLockup />

          {links.length > 0 ? (
            <nav className="hidden rounded-full border border-[#2f2617] bg-[#18130d] p-1 md:flex">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin' || to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 font-sans text-sm font-semibold transition',
                      isActive
                        ? 'bg-[#f4ab22] text-[#1a1309] shadow-[0_0_22px_-12px_rgba(244,171,34,0.85)]'
                        : 'text-[#9b8b72] hover:text-[#f0dec0]',
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
          ) : (
            <div className="hidden md:block" />
          )}

          {area === 'user' ? (
            <div className="flex items-center gap-2">
              <IconBadgeLink to="/saved" label="Đã lưu" count={savedCount} icon={Heart} />
              <IconBadgeLink to="/cart" label="Giỏ hàng" count={cartCount} icon={ShoppingCart} />
              <Link
                to="/login"
                aria-label="Tài khoản"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a2e1d] bg-[#18120d] text-[#d8c9ae] transition hover:border-[#8b6f38] hover:text-[#f4ab22]"
              >
                <UserRound className="h-4.5 w-4.5" />
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-4 py-2 font-sans text-sm font-semibold text-emerald-300">
              {products.length} sản phẩm
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] px-0">
        <Outlet />
      </main>
    </div>
  )
}
