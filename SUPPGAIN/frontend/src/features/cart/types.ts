export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Cart {
  cartId: string
  userId: string
  items: CartItem[]
  totalAmount: number
}

export interface AddToCartRequest {
  productId: string
  quantity: number
}
