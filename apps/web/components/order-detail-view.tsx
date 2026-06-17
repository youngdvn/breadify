import Link from "next/link"

import { InvoiceActions } from "@/components/invoice-actions"
import { fulfillmentLabels, paymentLabels } from "@/constants/order"
import type { Order } from "@/types"
import { formatCreatedTime } from "@/utils/date"
import { formatVnd } from "@/utils/format"
import { calculateIncludedVat } from "@/utils/pricing"
import { Button } from "@workspace/ui/components/button"

type OrderDetailViewProps = {
  order: Order
  secondaryHref?: string
  secondaryLabel?: string
}

function OrderDetailView({
  order,
  secondaryHref,
  secondaryLabel,
}: OrderDetailViewProps) {
  const vat = calculateIncludedVat(order.totalPrice)
  const createdTime = formatCreatedTime(order.createdAt)

  return (
    <>
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
          <div className="flex justify-between gap-4">
            <span>Khách hàng</span>
            <span className="text-right font-medium">
              {order.customerName ?? "Khách nhận tại quầy"}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Hình thức</span>
            <span className="font-medium">
              {fulfillmentLabels[order.fulfillmentType]}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Thanh toán</span>
            <span className="font-medium">
              {paymentLabels[order.paymentMethod]}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span>Thời gian tạo</span>
            <span className="text-right font-medium">{createdTime}</span>
          </div>
          <div className="flex justify-between gap-4">
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
        createdTime={createdTime}
        items={order.items.map((item) => ({
          name: item.nameSnapshot,
          quantity: item.quantity,
          price: formatVnd(item.unitPrice),
          total: formatVnd(item.lineTotal),
        }))}
        subtotal={formatVnd(order.subtotal)}
        shipping={formatVnd(order.shippingFee)}
        discount={formatVnd(order.discount)}
        vat={formatVnd(vat)}
        total={formatVnd(order.totalPrice)}
        secondaryHref={secondaryHref}
        secondaryLabel={secondaryLabel}
      />

      <Button asChild variant="ghost">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </>
  )
}

export { OrderDetailView }
