import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { cartItems, orderSummary } from "@/lib/mock-data"

export default function CartPage() {
  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Giỏ hàng
        </p>
        <h1 className="text-2xl font-semibold">Món đã chọn</h1>
      </div>

      <div className="grid gap-3">
        {cartItems.map((item) => (
          <article
            key={item.id}
            className="border-border/80 bg-card grid grid-cols-[3.5rem_1fr] gap-3 rounded-lg border p-3"
          >
            <div className="bg-muted flex size-14 items-center justify-center rounded-2xl text-2xl">
              {item.emoji}
            </div>
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="font-medium">{item.name}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {item.note}
                  </p>
                </div>
                <p className="text-sm font-semibold">x{item.quantity}</p>
              </div>
              <div className="mt-3 flex items-center justify-between text-sm">
                <p className="text-muted-foreground">{item.price}/phần</p>
                <p className="font-semibold">{item.total}</p>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="bg-muted grid gap-2 rounded-3xl p-4 text-sm">
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
          <span>Tổng cộng</span>
          <span>{orderSummary.total}</span>
        </div>
      </div>

      <div className="grid gap-2">
        <Button asChild>
          <Link href="/checkout">Thanh toán</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/menu">Thêm món</Link>
        </Button>
      </div>
    </section>
  )
}
