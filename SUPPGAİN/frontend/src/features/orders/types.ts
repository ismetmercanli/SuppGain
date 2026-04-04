export interface OrderItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface Order {
  orderId: string
  userId: string
  status: string
  totalAmount: number
  items: OrderItem[]
  createdAtUtc: string
}
