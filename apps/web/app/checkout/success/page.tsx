import { notFound } from "next/navigation"

import { OrderDetailView } from "@/components/order-detail-view"
import { fulfillmentLabels } from "@/constants/order"
import { getOrder } from "@/services/order-service"

type CheckoutSuccessPageProps = {
  searchParams: Promise<{
    orderId?: string | string[]
  }>
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

      <OrderDetailView
        order={order}
        secondaryHref={`/orders/${order.id}`}
        secondaryLabel="Xem chi tiết đơn hàng"
      />
    </section>
  )
}
