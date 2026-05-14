import { create } from 'zustand'
import {
  COUNTRY_API_URL,
  COUNTRY_CACHE_TTL_MS,
  COUNTRY_STORAGE_KEY,
  DEFAULT_COUNTRY_OPTIONS,
  INITIAL_PRODUCTS,
  normalizeCountryName,
  type CountryOption,
} from '../data/market'
import type { Product } from '../types/product'

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
  countryOptions: CountryOption[]
  hasInitializedCountryOptions: boolean
  isLoadingCountryOptions: boolean
  addProduct: (product: Product) => void
  updateProduct: (product: Product) => void
  deleteProduct: (productId: string) => void
  initializeCountryOptions: () => Promise<void>
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
