import Link from "next/link"

import { EditableAddress } from "@/components/editable-address"
import { Button } from "@workspace/ui/components/button"
import {
  cartItems,
  checkoutInfo,
  momoQrCells,
  orderSummary,
  paymentMethods,
} from "@/lib/mock-data"

type CheckoutPageProps = {
  searchParams: Promise<{
    payment?: string | string[]
  }>
}

export default async function CheckoutPage({
  searchParams,
}: CheckoutPageProps) {
  const { payment } = await searchParams
  const selectedPaymentId = payment === "momo" ? "momo" : "cash"
  const selectedPayment = paymentMethods.find(
    (method) => method.id === selectedPaymentId
  )

  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Thanh toán
        </p>
        <h1 className="text-2xl font-semibold">Xác nhận đơn hàng</h1>
      </div>

      <div className="border-border/80 bg-card grid gap-3 rounded-lg border p-4 text-sm">
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Khách hàng</span>
          <span className="font-medium">{checkoutInfo.customerName}</span>
        </div>
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Số điện thoại</span>
          <span className="font-medium">{checkoutInfo.phone}</span>
        </div>
        <EditableAddress initialAddress={checkoutInfo.address} />
        <div className="flex justify-between gap-3">
          <span className="text-muted-foreground">Thời gian</span>
          <span className="font-medium">{checkoutInfo.pickupTime}</span>
        </div>
      </div>

      <div className="grid gap-3">
        <h2 className="font-semibold">Thông tin đơn hàng</h2>
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="bg-muted flex items-center justify-between rounded-2xl p-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {item.name} x{item.quantity}
              </p>
              <p className="text-muted-foreground mt-1">{item.note}</p>
            </div>
            <p className="font-semibold">{item.total}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Phương thức thanh toán
          </p>
          <h2 className="font-semibold">Bạn muốn thanh toán bằng gì?</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {paymentMethods.map((method) => {
            const isSelected = method.id === selectedPaymentId

            return (
              <Link
                key={method.id}
                href={`/checkout?payment=${method.id}`}
                aria-current={isSelected ? "true" : undefined}
                className={
                  isSelected
                    ? "border-primary bg-primary/10 text-primary rounded-lg border px-4 py-2"
                    : "border-border/80 bg-card hover:bg-muted/50 rounded-lg border px-4 py-2 transition-colors"
                }
              >
                <p className="mt-2 font-semibold">{method.label}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-4">
                  {method.description}
                </p>
              </Link>
            )
          })}
        </div>

        {selectedPaymentId === "momo" ? (
          <div className="border-border/80 bg-card rounded-lg border p-4 text-center">
            <p className="font-semibold">Quét mã QR MoMo</p>
            <p className="text-muted-foreground mt-1 text-sm">
              Nội dung: Breadify BD-2406 · {orderSummary.total}
            </p>
            <div className="bg-background mx-auto mt-4 grid size-40 grid-cols-9 gap-1 rounded-lg border p-3">
              {momoQrCells.map((cell, index) => (
                <span
                  key={`${cell}-${index}`}
                  className={cell ? "bg-foreground rounded-[3px]" : "bg-muted"}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-border/80 bg-card grid gap-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span>Phương thức</span>
          <span className="font-medium">{selectedPayment?.label}</span>
        </div>
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{orderSummary.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí giao hàng</span>
          <span>{orderSummary.shipping}</span>
        </div>
        <div className="flex justify-between text-primary">
          <span>Ưu đãi</span>
          <span>{orderSummary.discount}</span>
        </div>
        <div className="border-border mt-2 flex justify-between border-t pt-3 text-base font-semibold">
          <span>Cần thanh toán</span>
          <span>{orderSummary.total}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button asChild>
          <Link href={`/checkout/success?payment=${selectedPaymentId}`}>
            Thanh toán ngay
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">Quay lại giỏ hàng</Link>
        </Button>
      </div>
    </section>
  )
}
