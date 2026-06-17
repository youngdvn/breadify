type FulfillmentType = "pickup" | "delivery"
type PaymentMethod = "cash" | "vietqr"

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
  fulfillmentType: FulfillmentType
  paymentMethod: PaymentMethod
  paymentStatus: string
  createdAt?: string
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

type CreateOrderPayload = {
  fulfillmentType: FulfillmentType
  paymentMethod: PaymentMethod
  customerName: string
  phone: string
  address: string
  note: string
}

export type {
  CreateOrderPayload,
  FulfillmentType,
  Order,
  OrderItem,
  PaymentMethod,
}
