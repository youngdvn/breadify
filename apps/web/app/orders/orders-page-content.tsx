"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { getOrderClient } from "@/services/order-client-service"
import { getRecentOrderIds } from "@/services/recent-orders-service"
import type { Order } from "@/types"
import { formatCreatedTime } from "@/utils/date"
import { formatVnd } from "@/utils/format"
import { Button } from "@workspace/ui/components/button"

function OrdersPageContent() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadOrders() {
      const orderIds = getRecentOrderIds()
      const loadedOrders = await Promise.all(
        orderIds.map((orderId) =>
          getOrderClient(orderId).catch(() => null)
        )
      )

      if (!isMounted) {
        return
      }

      setOrders(loadedOrders.filter((order): order is Order => Boolean(order)))
      setIsLoading(false)
    }

    loadOrders().catch(() => {
      if (isMounted) {
        setOrders([])
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <section className="grid gap-5 px-4 py-5">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Đơn hàng
        </p>
        <h1 className="text-2xl font-semibold">Lịch sử đặt bánh</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Hiển thị các đơn đã tạo trên thiết bị này.
        </p>
      </div>

      {isLoading ? (
        <div className="bg-muted rounded-3xl p-5 text-sm">
          Đang tải đơn hàng...
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-muted grid gap-3 rounded-3xl p-5 text-center">
          <p className="text-4xl">🧾</p>
          <h2 className="font-semibold">Chưa có đơn hàng</h2>
          <p className="text-muted-foreground text-sm">
            Sau khi checkout thành công, đơn sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="border-border/80 bg-card rounded-3xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">#{order.shortId}</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {formatCreatedTime(order.createdAt)}
                  </p>
                </div>
                <span className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-semibold">
                  {order.status}
                </span>
              </div>
              <p className="text-muted-foreground mt-3 text-sm leading-5">
                {order.items
                  .map((item) => `${item.nameSnapshot} x${item.quantity}`)
                  .join(", ")}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="font-semibold">{formatVnd(order.totalPrice)}</p>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/orders/${order.id}`}>Chi tiết</Link>
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      <Button asChild>
        <Link href="/menu">Đặt thêm bánh mì</Link>
      </Button>
    </section>
  )
}

export { OrdersPageContent }
