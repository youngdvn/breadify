import Link from "next/link"
import { notFound } from "next/navigation"

import { InvoiceActions } from "@/components/invoice-actions"
import { getOrder } from "@/lib/api/cart"
import { formatVnd } from "@/lib/format"
import { Button } from "@workspace/ui/components/button"

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string | string[]
  }>
}

const paymentLabels = {
  cash: "Tiền mặt",
  vietqr: "Chuyển khoản",
}

const fulfillmentLabels = {
  pickup: "Nhận tại quầy",
  delivery: "Giao hàng",
}

export const dynamic = "force-dynamic"

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { orderId } = await searchParams
  const normalizedOrderId = Array.isArray(orderId) ? orderId[0] : orderId

  if (!normalizedOrderId) {
    notFound()
  }

  const order = await getOrder(normalizedOrderId)

  if (!order) {
    notFound()
  }

  return (
    <section className="grid gap-5 px-4 py-5">
      <div className="bg-primary/10 grid justify-items-center rounded-[2rem] p-6 text-center">
        <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-full text-3xl">
          ✓
        </div>
        <p className="text-primary mt-4 text-sm font-semibold">
          Đặt hàng thành công
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Đơn #{order.shortId} đã được nhận
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Breadify đang chuẩn bị bánh. Hình thức:{" "}
          {fulfillmentLabels[order.fulfillmentType]}.
        </p>
      </div>

      <div className="border-border/80 bg-card rounded-3xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Hóa đơn online</h2>
          <span className="text-primary text-sm font-semibold">
            {formatVnd(order.totalPrice)}
          </span>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {item.nameSnapshot} x{item.quantity}
              </span>
              <span className="font-medium">{formatVnd(item.lineTotal)}</span>
            </div>
          ))}
        </div>
        <div className="border-border mt-4 grid gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Khách hàng</span>
            <span className="font-medium">
              {order.customerName ?? "Khách nhận tại quầy"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Thanh toán</span>
            <span className="font-medium">
              {paymentLabels[order.paymentMethod]}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Phí giao hàng</span>
            <span className="font-medium">{formatVnd(order.shippingFee)}</span>
          </div>
        </div>
      </div>

      <InvoiceActions
        orderId={order.shortId}
        customerName={order.customerName ?? "Khách nhận tại quầy"}
        phone={order.phone ?? ""}
        address={order.address ?? fulfillmentLabels[order.fulfillmentType]}
        paymentLabel={paymentLabels[order.paymentMethod]}
        paymentQrCodeUrl={order.paymentQrCodeUrl}
        pickupTime="Đang chuẩn bị"
        items={order.items.map((item) => ({
          name: item.nameSnapshot,
          quantity: item.quantity,
          price: formatVnd(item.unitPrice),
          total: formatVnd(item.lineTotal),
        }))}
        subtotal={formatVnd(order.subtotal)}
        shipping={formatVnd(order.shippingFee)}
        discount={formatVnd(order.discount)}
        total={formatVnd(order.totalPrice)}
      />

      <Button asChild variant="ghost">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </section>
  )
}
