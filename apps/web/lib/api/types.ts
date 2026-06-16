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

type OrderItem = {
  id: string
  menuItemId: string
  nameSnapshot: string
  unitPrice: number
  quantity: number
  note?: string
  lineTotal: number
}

type Order = {
  id: string
  shortId: string
  status: string
  fulfillmentType: "pickup" | "delivery"
  paymentMethod: "cash" | "vietqr"
  paymentStatus: string
  createdAt: string
  paymentQrCodeUrl?: string
  customerName?: string
  phone?: string
  address?: string
  note?: string
  subtotal: number
  shippingFee: number
  discount: number
  totalPrice: number
  items: OrderItem[]
}

export type { Cart, CartItem, Order, OrderItem }
