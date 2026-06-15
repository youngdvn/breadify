import Link from "next/link"

import { InvoiceActions } from "@/components/invoice-actions"
import { Button } from "@workspace/ui/components/button"
import {
  cartItems,
  checkoutInfo,
  orderSummary,
  paymentMethods,
} from "@/lib/mock-data"

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    payment?: string | string[]
  }>
}

export default async function CheckoutSuccessPage({
  searchParams,
}: CheckoutSuccessPageProps) {
  const { payment } = await searchParams
  const selectedPaymentId = payment === "momo" ? "momo" : "cash"
  const selectedPayment = paymentMethods.find(
    (method) => method.id === selectedPaymentId
  )

  return (
    <section className="grid gap-5 px-4 py-5">
      <div className="bg-primary/10 grid justify-items-center rounded-[2rem] p-6 text-center">
        <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-full text-3xl">
          ✓
        </div>
        <p className="text-primary mt-4 text-sm font-semibold">
          Thanh toán thành công
        </p>
        <h1 className="mt-2 text-2xl font-semibold">
          Đơn #BD-2406 đã được nhận
        </h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Breadify đang chuẩn bị bánh. Dự kiến sẵn sàng lúc{" "}
          {checkoutInfo.pickupTime}.
        </p>
      </div>

      <div className="border-border/80 bg-card rounded-3xl border p-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Hóa đơn online</h2>
          <span className="text-primary text-sm font-semibold">
            {orderSummary.total}
          </span>
        </div>
        <div className="mt-4 grid gap-2 text-sm">
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between gap-3">
              <span className="text-muted-foreground">
                {item.name} x{item.quantity}
              </span>
              <span className="font-medium">{item.total}</span>
            </div>
          ))}
        </div>
        <div className="border-border mt-4 grid gap-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span>Khách hàng</span>
            <span className="font-medium">{checkoutInfo.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span>Thanh toán</span>
            <span className="font-medium">{selectedPayment?.label}</span>
          </div>
        </div>
      </div>

      <InvoiceActions
        orderId="BD-2406"
        customerName={checkoutInfo.customerName}
        phone={checkoutInfo.phone}
        address={checkoutInfo.address}
        paymentLabel={selectedPayment?.label ?? "Tiền mặt"}
        pickupTime={checkoutInfo.pickupTime}
        items={cartItems}
        subtotal={orderSummary.subtotal}
        shipping={orderSummary.shipping}
        discount={orderSummary.discount}
        total={orderSummary.total}
      />

      <Button asChild variant="ghost">
        <Link href="/">Về trang chủ</Link>
      </Button>
    </section>
  )
}
