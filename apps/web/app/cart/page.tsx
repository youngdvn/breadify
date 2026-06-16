import Link from "next/link"

import { CartItemControls } from "@/app/cart/cart-item-controls"
import { getCart } from "@/lib/api/cart"
import { formatVnd } from "@/lib/format"
import { Button } from "@workspace/ui/components/button"

export const dynamic = "force-dynamic"

export default async function CartPage() {
  const cart = await getCart()
  const isEmpty = cart.items.length === 0

  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Giỏ hàng
        </p>
        <h1 className="text-2xl font-semibold">Món đã chọn</h1>
      </div>

      {isEmpty ? (
        <div className="bg-muted grid gap-3 rounded-3xl p-5 text-center">
          <p className="text-4xl">🧺</p>
          <h2 className="font-semibold">Giỏ hàng đang trống</h2>
          <p className="text-muted-foreground text-sm">
            Chọn bánh mì trước khi thanh toán.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {cart.items.map((item) => (
            <article
              key={item.id}
              className="border-border/80 bg-card grid grid-cols-[3.5rem_1fr] gap-3 rounded-lg border p-3"
            >
              <div className="bg-muted flex size-14 items-center justify-center rounded-2xl text-2xl">
                🥖
              </div>
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="font-medium">{item.name}</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.note || "Chưa có ghi chú"}
                    </p>
                  </div>
                  <p className="text-sm font-semibold">x{item.quantity}</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">
                    {formatVnd(item.price)}/phần
                  </p>
                  <p className="font-semibold">{formatVnd(item.lineTotal)}</p>
                </div>
                <CartItemControls
                  itemId={item.id}
                  initialQuantity={item.quantity}
                  initialNote={item.note}
                />
              </div>
            </article>
          ))}
        </div>
      )}

      <div className="bg-muted grid gap-2 rounded-3xl p-4 text-sm">
        <div className="flex justify-between">
          <span>Tạm tính</span>
          <span>{formatVnd(cart.subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span>Phí giao hàng</span>
          <span>Tính ở bước thanh toán</span>
        </div>
        <div className="flex justify-between text-primary">
          <span>Ưu đãi</span>
          <span>{formatVnd(cart.discount)}</span>
        </div>
        <div className="border-border mt-2 flex justify-between border-t pt-3 text-base font-semibold">
          <span>Tổng tạm tính</span>
          <span>{formatVnd(cart.subtotal - cart.discount)}</span>
        </div>
      </div>

      <div className="grid gap-2">
        {isEmpty ? (
          <Button disabled>Thanh toán</Button>
        ) : (
          <Button asChild>
            <Link href="/checkout">Thanh toán</Link>
          </Button>
        )}
        <Button asChild variant="outline">
          <Link href="/menu">Thêm món</Link>
        </Button>
      </div>
    </section>
  )
}
