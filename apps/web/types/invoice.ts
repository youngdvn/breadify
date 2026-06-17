type InvoiceItem = {
  name: string
  quantity: number
  price: string
  total: string
}

type InvoiceActionsProps = {
  orderId: string
  customerName: string
  phone: string
  address: string
  paymentLabel: string
  paymentQrCodeUrl?: string
  createdTime: string
  items: InvoiceItem[]
  subtotal: string
  shipping: string
  discount: string
  vat: string
  total: string
  secondaryHref?: string
  secondaryLabel?: string
}

export type { InvoiceActionsProps, InvoiceItem }
