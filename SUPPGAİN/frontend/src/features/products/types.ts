export interface Product {
  id: string
  name: string
  description: string
  imageUrl?: string | null
  price: number
  stock: number
  category: string
  isActive: boolean
}

export interface ProductQuery {
  name?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  isActive?: boolean
}

export interface SaveProductRequest {
  name: string
  description: string
  imageUrl?: string | null
  price: number
  stock: number
  category: string
  isActive: boolean
}
