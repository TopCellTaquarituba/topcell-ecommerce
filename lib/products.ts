export interface Product {
  id: string
  name: string
  price: number
  originalPrice?: number
  image: string
  category: string
  brand: string
  rating: number
  description: string
  specifications: { [key: string]: string }
  images: string[]
  inStock: boolean
  createdAt?: string
  reviews?: Review[]
}

export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  rating: number
  title: string
  comment: string
  date: string
  helpful: number
  verified: boolean
}

// Dados zerados para cadastro manual
export function getProducts(): Product[] {
  return []
}

export function getProductById(id: string): Product | undefined {
  return undefined
}

export function getProductsByCategory(category: string): Product[] {
  return []
}
