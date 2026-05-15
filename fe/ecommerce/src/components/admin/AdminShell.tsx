import {
  Bell,
  Folder,
  Grid2x2,
  Menu,
  Package,
  Settings,
  UserRound,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useMarketStore } from '../../store/useMarketStore'

type CounterKey = 'categories' | 'products'

type AdminNavItem = {
  to: string
  label: string
  icon: typeof Grid2x2
  countKey?: CounterKey
}

const pageTitles: Record<string, string> = {
  '/admin': 'Dashboard',
  '/admin/category': 'Danh mục',
  '/admin/product': 'Sản phẩm',
  '/admin/settings': 'Cài đặt',
}

const navGroups: { section: string; items: AdminNavItem[] }[] = [
  {
    section: 'Tổng quan',
    items: [{ to: '/admin', label: 'Dashboard', icon: Grid2x2 }],
  },
  {
    section: 'Catalog',
    items: [
      { to: '/admin/category', label: 'Danh mục', icon: Folder, countKey: 'categories' },
      { to: '/admin/product', label: 'Sản phẩm', icon: Package, countKey: 'products' },
    ],
  },
  {
    section: 'Hệ thống',
    items: [{ to: '/admin/settings', label: 'Cài đặt', icon: Settings }],
  },
]

export function AdminShell() {
  const location = useLocation()
  const products = useMarketStore((state) => state.products)
  const categories = useMarketStore((state) => state.categories)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const counts = useMemo(
    () => ({
      products: products.length,
      categories: categories.length,
    }),
    [categories.length, products.length],
  )

  const title = pageTitles[location.pathname] ?? 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden bg-[#0e0c0a] text-[#f0ece6]">
      {sidebarOpen ? (
        <aside className="flex h-full w-[270px] shrink-0 flex-col overflow-hidden border-r border-[#2e2a24] bg-[#111009]">
          <div className="flex items-center gap-3 border-b border-[#2e2a24] px-5 py-[19px]">
            <div className="flex h-[46px] w-[46px] items-center justify-center rounded-xl bg-[#f7931a] font-display text-2xl font-bold text-white">
              E
            </div>
            <div>
              <div className="font-display text-[2rem] font-bold leading-none tracking-[0.18em] text-white">
                SHOP
              </div>
              <div className="mt-1 pl-[2px] text-[0.62rem] uppercase tracking-[0.5em] text-[#7a7570]">
                Admin
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-3 py-6">
            {navGroups.map((group) => (
              <section key={group.section} className="mb-7">
                <div className="mb-3 px-2 text-[0.62rem] uppercase tracking-[0.42em] text-[#7a7570]">
                  {group.section}
                </div>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const count = item.countKey ? counts[item.countKey as keyof typeof counts] : null

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === '/admin'}
                        className={({ isActive }) =>
                          [
                            'flex items-center gap-3 rounded-[13px] px-3 py-3 text-[1.06rem] transition',
                            isActive
                              ? 'bg-[#3a2408] text-[#f7931a]'
                              : 'text-[#9a948f] hover:bg-white/[0.03] hover:text-[#f0ece6]',
                          ].join(' ')
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <Icon size={18} strokeWidth={1.9} />
                            <span className="flex-1">{item.label}</span>
                            {count !== null ? (
                              <span
                                className={[
                                  'rounded-full border px-2 py-[1px] text-[0.72rem] font-semibold',
                                  isActive
                                    ? 'border-[#6f4c1d] bg-[#4a2d0a] text-[#d9c09c]'
                                    : 'border-[#2e2a24] bg-white/[0.04] text-[#7a7570]',
                                ].join(' ')}
                              >
                                {count}
                              </span>
                            ) : null}
                          </>
                        )}
                      </NavLink>
                    )
                  })}
                </div>
              </section>
            ))}
          </nav>

          <div className="border-t border-[#2e2a24] px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#664012] bg-[#23160a] text-[#f7931a]">
                <UserRound size={19} strokeWidth={1.7} />
              </div>
              <div className="min-w-0">
                <div className="truncate text-[1.02rem] font-semibold text-white">Admin</div>
                <div className="truncate text-sm text-[#7a7570]">admin@eshop.vn</div>
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-[70px] shrink-0 items-center gap-4 border-b border-[#2e2a24] bg-[#1a1714]/90 px-7 backdrop-blur">
          <button
            type="button"
            onClick={() => setSidebarOpen((value) => !value)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#7a7570] transition hover:bg-white/[0.04] hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu size={21} strokeWidth={1.8} />
          </button>

          <div className="flex min-w-0 flex-col justify-center">
            <h1 className="truncate font-display text-[1.58rem] font-bold leading-none tracking-[-0.01em] text-white md:text-[1.92rem]">
              {title}
            </h1>
            <p className="mt-1 text-[0.8rem] font-medium text-[#7a7570]">
              Bảng điều khiển E SHOP
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[#3a3530] text-[#7a7570] transition hover:text-white"
              aria-label="Notifications"
            >
              <Bell size={18} strokeWidth={1.8} />
              <span className="absolute right-[7px] top-[7px] h-2 w-2 rounded-full bg-[#f7931a]" />
            </button>
            <button
              type="button"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-[#3a3530] text-[#7a7570] transition hover:text-white"
              aria-label="Profile"
            >
              <UserRound size={18} strokeWidth={1.8} />
            </button>
            <div className="h-5 w-px bg-[#2e2a24]" />
            <div className="text-xl leading-none text-[#7a7570]">···</div>
          </div>
        </header>

        <main className="min-h-0 flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
