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
  description: string
  country: string
  category: string
  rating: number
  colors: ProductColor[]
  sizes: string[]
  benefits: ProductBenefit[]
  tags: string[]
  sizeGuide: string
}

export type CartItem = {
  id: string
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
