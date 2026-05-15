export type ProductColor = {
  name: string
  hex: string
}

export type ProductBenefit = {
  title: string
  description: string
}

export type Product = {
  id: string
  name: string
  image: string
  images: string[]
  cost: number
  originalPrice?: number
  description: string
  country: string
  category: string
  rating: number
  status?: 'active' | 'inactive'
  inStock?: boolean
  colors: ProductColor[]
  sizes: string[]
  benefits: ProductBenefit[]
  tags: string[]
  sizeGuide: string
}

export type CartItem = {
  id: string
  productId?: string
  category: string
  name: string
  image: string
  unitPrice: number
  quantity: number
  color: {
    name: string
    hex: string
  }
  size: string
  saved: boolean
}

export type SavedItem = {
  id: string
  productId: string
  category: string
  name: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  country: string
  savedAtLabel: string
  accentTag?: string
  inStock: boolean
  colors: ProductColor[]
  size: string
}

export type ProductFormValues = {
  name: string
  image: string
  cost: string
  description: string
  country: string
  category: string
  rating: string
}

export type ProductFilters = {
  country: string
  costMin: number
  description: string
  category: string
  rating: string
}
