type CartItem = {
  id: string
  menuItemId: string
  slug: string
  name: string
  price: number
  quantity: number
  note?: string
  lineTotal: number
  description?: string
}

type Cart = {
  items: CartItem[]
  subtotal: number
  shippingFee: number
  discount: number
  total: number
}

export type { Cart, CartItem }
