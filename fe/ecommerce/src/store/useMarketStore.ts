import { create } from 'zustand'
import {
  INITIAL_ADMIN_CATEGORIES,
  COUNTRY_API_URL,
  COUNTRY_CACHE_TTL_MS,
  COUNTRY_STORAGE_KEY,
  DEFAULT_COUNTRY_OPTIONS,
  INITIAL_CART_ITEMS,
  INITIAL_PRODUCTS,
  INITIAL_SAVED_ITEMS,
  normalizeCountryName,
  type CountryOption,
} from '../data/market'
import type { AdminCategory } from '../types/admin'
import type { CartItem, Product, SavedItem } from '../types/product'

type CountryApiResponseItem = {
  name?: {
    common?: string
  }
  translations?: {
    vie?: {
      common?: string
    }
  }
}

type StoredCountryOptions = {
  expiresAt: number
  options: CountryOption[]
}

type MarketStore = {
  products: Product[]
  categories: AdminCategory[]
  cartItems: CartItem[]
  savedItems: SavedItem[]
  countryOptions: CountryOption[]
  hasInitializedCountryOptions: boolean
  isLoadingCountryOptions: boolean
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  addCategory: (category: AdminCategory) => void
  updateCategory: (category: AdminCategory) => void
  deleteCategory: (categoryId: string) => void
  updateCartItemQuantity: (cartItemId: string, quantity: number) => void
  removeCartItem: (cartItemId: string) => void
  toggleSavedCartItem: (cartItemId: string) => void
  removeSavedItem: (savedItemId: string) => void
  clearSavedItems: () => void
  addSavedItemToCart: (savedItemId: string) => void
  initializeCountryOptions: () => Promise<void>
}

function createSavedItemFromCartItem(cartItem: CartItem, products: Product[]): SavedItem {
  const product =
    products.find((item) => item.id === cartItem.productId) ??
    products.find((item) => item.name === cartItem.name)

  return {
    id: `saved-from-${cartItem.id}`,
    productId: product?.id ?? cartItem.productId ?? cartItem.id,
    category: product?.category ?? cartItem.category,
    name: product?.name ?? cartItem.name,
    image: product?.image ?? cartItem.image,
    price: product?.cost ?? cartItem.unitPrice,
    originalPrice: undefined,
    rating: product?.rating ?? 4,
    reviewCount: 32,
    country: product?.country ?? 'Vietnam',
    savedAtLabel: 'Vừa lưu hôm nay',
    accentTag: undefined,
    inStock: true,
    colors: product?.colors ?? [cartItem.color],
    size: cartItem.size.replace(/^Size\s*/i, ''),
  }
}

const COUNTRY_ALL_OPTION: CountryOption = DEFAULT_COUNTRY_OPTIONS[0]

function buildCountryOptions(
  products: Product[],
  preferredOptions: CountryOption[] = DEFAULT_COUNTRY_OPTIONS,
) {
  const optionByValue = new Map(preferredOptions.map((option) => [option.value, option]))
  const usedCountries = [...new Set(products.map((product) => product.country))]

  const options = usedCountries
    .map((country) => optionByValue.get(country) ?? { value: country, label: country })
    .sort((left, right) => left.label.localeCompare(right.label, 'vi'))

  return [COUNTRY_ALL_OPTION, ...options]
}

function readStoredCountryOptions() {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(COUNTRY_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue) as StoredCountryOptions
    if (
      !parsed ||
      !Array.isArray(parsed.options) ||
      typeof parsed.expiresAt !== 'number' ||
      parsed.expiresAt < Date.now()
    ) {
      window.localStorage.removeItem(COUNTRY_STORAGE_KEY)
      return null
    }

    return parsed.options
  } catch {
    window.localStorage.removeItem(COUNTRY_STORAGE_KEY)
    return null
  }
}

function storeCountryOptions(options: CountryOption[]) {
  if (typeof window === 'undefined') {
    return
  }

  const payload: StoredCountryOptions = {
    expiresAt: Date.now() + COUNTRY_CACHE_TTL_MS,
    options,
  }

  window.localStorage.setItem(COUNTRY_STORAGE_KEY, JSON.stringify(payload))
}

function mergeCountryOptions(countries: CountryApiResponseItem[]) {
  const fallbackValueByNormalized = new Map(
    DEFAULT_COUNTRY_OPTIONS.filter((option) => option.value !== COUNTRY_ALL_OPTION.value).map(
      (option) => [normalizeCountryName(option.value), option.value],
    ),
  )

  const optionsByNormalized = new Map(
    DEFAULT_COUNTRY_OPTIONS.filter((option) => option.value !== COUNTRY_ALL_OPTION.value).map(
      (option) => [normalizeCountryName(option.value), option],
    ),
  )

  for (const country of countries) {
    const commonName = country.name?.common?.trim()
    if (!commonName) {
      continue
    }

    const normalizedName = normalizeCountryName(commonName)
    const preferredValue =
      fallbackValueByNormalized.get(normalizedName) ?? commonName
    const label = country.translations?.vie?.common?.trim() || commonName

    optionsByNormalized.set(normalizedName, {
      value: preferredValue,
      label,
    })
  }

  const options = Array.from(optionsByNormalized.values()).sort((left, right) =>
    left.label.localeCompare(right.label, 'vi'),
  )

  return [COUNTRY_ALL_OPTION, ...options]
}

const initialCountryOptions = buildCountryOptions(
  INITIAL_PRODUCTS,
  readStoredCountryOptions() ?? DEFAULT_COUNTRY_OPTIONS,
)

export const useMarketStore = create<MarketStore>()((set, get) => ({
  products: INITIAL_PRODUCTS,
  categories: INITIAL_ADMIN_CATEGORIES,
  cartItems: INITIAL_CART_ITEMS,
  savedItems: INITIAL_SAVED_ITEMS,
  countryOptions: initialCountryOptions,
  hasInitializedCountryOptions: false,
  isLoadingCountryOptions: false,
  addProduct: (product) => {
    set((state) => {
      const products = [product, ...state.products]

      return {
        products,
        countryOptions: buildCountryOptions(products, state.countryOptions),
      }
    })
  },
  updateProduct: (product) => {
    set((state) => ({
      products: state.products.map((item) => (item.id === product.id ? product : item)),
      countryOptions: buildCountryOptions(
        state.products.map((item) => (item.id === product.id ? product : item)),
        state.countryOptions,
      ),
    }))
  },
  deleteProduct: (productId) => {
    set((state) => {
      const products = state.products.filter((item) => item.id !== productId)

      return {
        products,
        countryOptions: buildCountryOptions(products, state.countryOptions),
      }
    })
  },
  addCategory: (category) => {
    set((state) => ({
      categories: [...state.categories, category],
    }))
  },
  updateCategory: (category) => {
    set((state) => {
      const previousCategory = state.categories.find((item) => item.id === category.id)

      return {
        categories: state.categories.map((item) => (item.id === category.id ? category : item)),
        products: previousCategory
          ? state.products.map((product) =>
              product.category === previousCategory.name
                ? { ...product, category: category.name }
                : product,
            )
          : state.products,
      }
    })
  },
  deleteCategory: (categoryId) => {
    set((state) => ({
      categories: state.categories.filter((item) => item.id !== categoryId),
    }))
  },
  updateCartItemQuantity: (cartItemId, quantity) => {
    set((state) => ({
      cartItems: state.cartItems.map((item) =>
        item.id === cartItemId ? { ...item, quantity: Math.max(1, quantity) } : item,
      ),
    }))
  },
  removeCartItem: (cartItemId) => {
    set((state) => ({
      cartItems: state.cartItems.filter((item) => item.id !== cartItemId),
    }))
  },
  toggleSavedCartItem: (cartItemId) => {
    set((state) => {
      const currentItem = state.cartItems.find((item) => item.id === cartItemId)
      if (!currentItem) {
        return state
      }

      const nextSavedValue = !currentItem.saved
      const cartItems = state.cartItems.map((item) =>
        item.id === cartItemId ? { ...item, saved: nextSavedValue } : item,
      )

      if (nextSavedValue) {
        const savedItem = createSavedItemFromCartItem(currentItem, state.products)
        const existingIndex = state.savedItems.findIndex(
          (item) =>
            item.id === savedItem.id ||
            item.productId === savedItem.productId ||
            item.name === savedItem.name,
        )

        return {
          cartItems,
          savedItems:
            existingIndex >= 0
              ? state.savedItems.map((item, index) =>
                  index === existingIndex ? { ...item, ...savedItem, id: item.id } : item,
                )
              : [savedItem, ...state.savedItems],
        }
      }

      return {
        cartItems,
        savedItems: state.savedItems.filter((item) => item.id !== `saved-from-${currentItem.id}`),
      }
    })
  },
  removeSavedItem: (savedItemId) => {
    set((state) => {
      const targetItem = state.savedItems.find((item) => item.id === savedItemId)

      return {
        savedItems: state.savedItems.filter((item) => item.id !== savedItemId),
        cartItems: targetItem
          ? state.cartItems.map((item) =>
              item.id === savedItemId.replace(/^saved-from-/, '') ||
              item.productId === targetItem.productId
                ? { ...item, saved: false }
                : item,
            )
          : state.cartItems,
      }
    })
  },
  clearSavedItems: () => {
    set((state) => ({
      savedItems: [],
      cartItems: state.cartItems.map((item) => ({ ...item, saved: false })),
    }))
  },
  addSavedItemToCart: (savedItemId) => {
    set((state) => {
      const savedItem = state.savedItems.find((item) => item.id === savedItemId)
      if (!savedItem) {
        return state
      }

      const matchedItem = state.cartItems.find(
        (item) => item.productId === savedItem.productId && item.size === `Size ${savedItem.size}`,
      )

      if (matchedItem) {
        return {
          cartItems: state.cartItems.map((item) =>
            item.id === matchedItem.id ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        }
      }

      const nextCartItem: CartItem = {
        id: `cart-${savedItem.id}`,
        productId: savedItem.productId,
        category: savedItem.category,
        name: savedItem.name,
        image: savedItem.image,
        unitPrice: savedItem.price,
        quantity: 1,
        color: savedItem.colors[0] ?? { name: 'Mac dinh', hex: '#d6d3d1' },
        size: `Size ${savedItem.size}`,
        saved: true,
      }

      return {
        cartItems: [nextCartItem, ...state.cartItems],
      }
    })
  },
  initializeCountryOptions: async () => {
    const { hasInitializedCountryOptions, isLoadingCountryOptions } = get()
    if (hasInitializedCountryOptions || isLoadingCountryOptions) {
      return
    }

    set({ isLoadingCountryOptions: true })

    try {
      const response = await fetch(COUNTRY_API_URL)
      if (!response.ok) {
        throw new Error(`Failed to load countries: ${response.status}`)
      }

      const data = (await response.json()) as CountryApiResponseItem[]
      const mergedCountryOptions = mergeCountryOptions(data)
      const countryOptions = buildCountryOptions(get().products, mergedCountryOptions)

      set({
        countryOptions,
        hasInitializedCountryOptions: true,
        isLoadingCountryOptions: false,
      })
      storeCountryOptions(countryOptions)
    } catch {
      set({
        hasInitializedCountryOptions: true,
        isLoadingCountryOptions: false,
      })
    }
  },
}))
