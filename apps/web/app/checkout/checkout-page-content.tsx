"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api/client"
import type { Cart, Order } from "@/lib/api/types"
import { formatVnd } from "@/lib/format"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type FulfillmentType = "pickup" | "delivery"
type PaymentMethod = "cash" | "vietqr"

type CheckoutPageContentProps = {
  cart: Cart
  initialPayment: PaymentMethod
}

const deliveryShippingFee = 20000

const paymentMethods = [
  {
    id: "cash",
    label: "Tiền mặt",
    description: "Thanh toán khi nhận bánh",
  },
  {
    id: "vietqr",
    label: "Chuyển khoản",
    description: "QR sẽ nằm trên hóa đơn",
  },
] satisfies Array<{
  id: PaymentMethod
  label: string
  description: string
}>

function CheckoutPageContent({ cart, initialPayment }: CheckoutPageContentProps) {
  const router = useRouter()
  const [fulfillmentType, setFulfillmentType] =
    useState<FulfillmentType>("pickup")
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>(initialPayment)
  const [customerName, setCustomerName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [note, setNote] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const shippingFee = fulfillmentType === "delivery" ? deliveryShippingFee : 0
  const total = cart.subtotal + shippingFee - cart.discount
  const selectedPayment = useMemo(
    () => paymentMethods.find((method) => method.id === paymentMethod),
    [paymentMethod]
  )

  async function submitOrder() {
    if (cart.items.length === 0) {
      toast.error("Giỏ hàng đang trống")
      return
    }

    if (
      fulfillmentType === "delivery" &&
      (!customerName.trim() || !phone.trim() || !address.trim())
    ) {
      toast.error("Vui lòng nhập tên, SĐT và địa chỉ giao hàng")
      return
    }

    setIsSubmitting(true)
    try {
      const response = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          fulfillmentType,
          paymentMethod,
          customerName,
          phone,
          address,
          note,
        }),
      })

      if (!response.ok) {
        throw new Error("Cannot create order")
      }

      const order = (await response.json()) as Order
      toast.success("Đã tạo đơn hàng")
      router.push(`/checkout/success?orderId=${order.id}`)
      router.refresh()
    } catch {
      toast.error("Không thể tạo đơn hàng")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Thanh toán
        </p>
        <h1 className="text-2xl font-semibold">Xác nhận đơn hàng</h1>
      </div>

      <div className="grid gap-3">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">
            Hình thức nhận hàng
          </p>
          <h2 className="font-semibold">Bạn muốn nhận bánh thế nào?</h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {[
            ["pickup", "Nhận tại quầy", "Không cần nhập thông tin"],
            ["delivery", "Giao hàng", "Phí cố định 20.000đ"],
          ].map(([id, label, description]) => {
            const isSelected = id === fulfillmentType

            return (
              <button
                key={id}
                type="button"
                onClick={() => setFulfillmentType(id as FulfillmentType)}
                className={
                  isSelected
                    ? "border-primary bg-primary/10 text-primary rounded-lg border px-4 py-3 text-left"
                    : "border-border/80 bg-card hover:bg-muted/50 rounded-lg border px-4 py-3 text-left transition-colors"
                }
              >
                <p className="font-semibold">{label}</p>
                <p className="text-muted-foreground mt-1 text-xs leading-4">
                  {description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {fulfillmentType === "delivery" ? (
        <div className="border-border/80 bg-card grid gap-3 rounded-lg border p-4 text-sm">
          <Input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Tên khách hàng"
            aria-label="Tên khách hàng"
          />
          <Input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Số điện thoại"
            aria-label="Số điện thoại"
            inputMode="tel"
          />
          <textarea
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            placeholder="Địa chỉ giao hàng"
            aria-label="Địa chỉ giao hàng"
            className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          />
        </div>
      ) : (
        <div className="bg-muted rounded-3xl p-4 text-sm">
          Nhận tại quầy Breadify, không cần nhập tên và số điện thoại.
        </div>
      )}

      <div className="grid gap-3">
        <h2 className="font-semibold">Thông tin đơn hàng</h2>
        {cart.items.map((item) => (
          <div
            key={item.id}
            className="bg-muted flex items-center justify-between rounded-2xl p-3 text-sm"
          >
            <div>
              <p className="font-medium">
                {item.name} x{item.quantity}
              </p>
              {item.note ? (
                <p className="text-muted-foreground mt-1">{item.note}</p>
              ) : null}
            </div>
            <p className="font-semibold">{formatVnd(item.lineTotal)}</p>
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
            const isSelected = method.id === paymentMethod

            return (
              <button
                key={method.id}
                type="button"
                onClick={() => setPaymentMethod(method.id)}
                className={
                  isSelected
                    ? "border-primary bg-primary/10 text-primary rounded-lg border px-3 py-2 text-left"
                    : "border-border/80 bg-card hover:bg-muted/50 rounded-lg border px-3 py-2 text-left transition-colors"
                }
              >
                <p className="font-semibold">{method.label}</p>
                <p className="text-muted-foreground mt-1 text-[0.68rem] leading-4">
                  {method.description}
                </p>
              </button>
            )
          })}
        </div>

        {paymentMethod === "vietqr" ? (
          <div className="border-border/80 bg-card rounded-lg border p-4">
            <p className="font-semibold">Chuyển khoản ngân hàng</p>
            <p className="text-muted-foreground mt-1 text-sm leading-6">
              Mã QR chuyển khoản sẽ được hiển thị trong hóa đơn online sau khi
              xuất bill.
            </p>
          </div>
        ) : null}
      </div>

      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú cho đơn hàng"
        aria-label="Ghi chú cho đơn hàng"
        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-20 rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      />

      <div className="border-border/80 bg-card grid gap-2 rounded-lg border p-4 text-sm">
        <div className="flex justify-between">
          <span>Phương thức</span>
          <span className="font-medium">{selectedPayment?.label}</span>
        </div>
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatVnd(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí giao hàng</span>
          <span>{formatVnd(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-primary">
          <span>Ưu đãi</span>
          <span>{formatVnd(cart.discount)}</span>
        </div>
        <div className="border-border mt-2 flex justify-between border-t pt-3 text-base font-semibold">
          <span>Cần thanh toán</span>
          <span>{formatVnd(total)}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button onClick={submitOrder} disabled={isSubmitting}>
          {isSubmitting ? "Đang tạo đơn" : "Thanh toán ngay"}
        </Button>
        <Button asChild variant="outline">
          <Link href="/cart">Quay lại giỏ hàng</Link>
        </Button>
      </div>
    </section>
  )
}

export { CheckoutPageContent }
