import Link from "next/link"

import { Button } from "@workspace/ui/components/button"
import { orders } from "@/lib/mock-data"

export default function OrdersPage() {
  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Đơn hàng
        </p>
        <h1 className="text-2xl font-semibold">Lịch sử đặt bánh</h1>
      </div>

      <div className="grid gap-3">
        {orders.map((order) => (
          <article
            key={order.id}
            className="border-border/80 bg-card rounded-3xl border p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">#{order.id}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {order.date}
                </p>
              </div>
              <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-semibold">
                {order.status}
              </span>
            </div>
            <p className="text-muted-foreground mt-3 text-sm leading-5">
              {order.items}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <p className="font-semibold">{order.total}</p>
              <Button asChild size="sm" variant="outline">
                <Link href="/checkout/success">Chi tiết</Link>
              </Button>
            </div>
          </article>
        ))}
      </div>

      <Button asChild>
        <Link href="/menu">Đặt thêm bánh mì</Link>
      </Button>
    </section>
  )
}
