import Link from "next/link"
import { notFound } from "next/navigation"

import { OrderDetailView } from "@/components/order-detail-view"
import { getOrder } from "@/services/order-service"
import { Button } from "@workspace/ui/components/button"

type OrderDetailPageProps = {
  params: Promise<{
    id: string
  }>
}

export const dynamic = "force-dynamic"

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const order = await getOrder(id)

  if (!order) {
    notFound()
  }

  return (
    <section className="grid gap-5 px-4 py-5">
      <Button asChild variant="ghost" size="sm" className="w-fit">
        <Link href="/orders">← Quay lại đơn hàng</Link>
      </Button>

      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Chi tiết đơn hàng
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Đơn #{order.shortId}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Trạng thái: {order.status}
        </p>
      </div>

      <OrderDetailView order={order} />
    </section>
  )
}
