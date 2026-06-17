"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  IconArrowRight,
  IconCheck,
  IconRefresh,
  IconX,
} from "@tabler/icons-react"
import { toast } from "sonner"

import {
  fulfillmentLabels,
  orderStatusLabels,
  paymentLabels,
  paymentStatusLabels,
} from "@/constants/order"
import {
  getAdminOrders,
  updateAdminOrderStatus,
} from "@/services/admin-orders-service"
import type { Order, OrderStatus } from "@/types/order"
import { formatVnd } from "@/utils/format"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

type StatusFilter = OrderStatus | "all"

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "pending", label: orderStatusLabels.pending },
  { value: "in_progress", label: orderStatusLabels.in_progress },
  { value: "done", label: orderStatusLabels.done },
  { value: "cancelled", label: orderStatusLabels.cancelled },
]

const statusClassNames: Record<OrderStatus, string> = {
  pending: "bg-primary/10 text-primary",
  in_progress: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  done: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  cancelled: "bg-destructive/10 text-destructive",
}

function AdminOrdersPageContent() {
  const router = useRouter()
  const [orders, setOrders] = React.useState<Order[]>([])
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>("all")
  const [isLoading, setIsLoading] = React.useState(true)
  const [updatingOrderId, setUpdatingOrderId] = React.useState<string | null>(
    null
  )

  const loadOrders = React.useCallback(async () => {
    setIsLoading(true)

    try {
      const data = await getAdminOrders(statusFilter)
      setOrders(data.items)
    } catch {
      toast.error("Không tải được danh sách đơn")
      router.replace("/admin/login")
    } finally {
      setIsLoading(false)
    }
  }, [router, statusFilter])

  React.useEffect(() => {
    let isActive = true

    getAdminOrders(statusFilter)
      .then((data) => {
        if (isActive) {
          setOrders(data.items)
        }
      })
      .catch(() => {
        toast.error("Không tải được danh sách đơn")
        router.replace("/admin/login")
      })
      .finally(() => {
        if (isActive) {
          setIsLoading(false)
        }
      })

    return () => {
      isActive = false
    }
  }, [router, statusFilter])

  async function updateStatus(order: Order, nextStatus: OrderStatus) {
    setUpdatingOrderId(order.id)

    try {
      const updatedOrder = await updateAdminOrderStatus(order.id, nextStatus)
      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) =>
          currentOrder.id === updatedOrder.id ? updatedOrder : currentOrder
        )
      )
      toast.success(`Đã cập nhật đơn #${updatedOrder.shortId}`)
    } catch {
      toast.error("Không cập nhật được trạng thái đơn")
    } finally {
      setUpdatingOrderId(null)
    }
  }

  const hasOrders = orders.length > 0

  return (
    <section className="grid gap-6">
      <div className="rounded-[2rem] border border-border/80 bg-background p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Admin orders
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Đơn hàng</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Theo dõi và cập nhật trạng thái đơn từ checkout thật.
            </p>
          </div>
          <Button variant="outline" onClick={loadOrders} disabled={isLoading}>
            <IconRefresh />
            Làm mới
          </Button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => {
                setIsLoading(true)
                setStatusFilter(filter.value)
              }}
              className={cn(
                "rounded-xl border border-border/80 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted",
                statusFilter === filter.value &&
                  "border-primary/20 bg-primary/10 text-primary"
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="rounded-[2rem] border border-border/80 bg-background p-6 text-sm text-muted-foreground shadow-sm">
            Đang tải đơn hàng...
          </div>
        ) : null}

        {!isLoading && !hasOrders ? (
          <div className="rounded-[2rem] border border-border/80 bg-background p-6 text-sm text-muted-foreground shadow-sm">
            Chưa có đơn hàng trong bộ lọc này.
          </div>
        ) : null}

        {!isLoading
          ? orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                isUpdating={updatingOrderId === order.id}
                onUpdateStatus={updateStatus}
              />
            ))
          : null}
      </div>
    </section>
  )
}

type OrderCardProps = {
  order: Order
  isUpdating: boolean
  onUpdateStatus: (order: Order, nextStatus: OrderStatus) => void
}

function OrderCard({ order, isUpdating, onUpdateStatus }: OrderCardProps) {
  const itemSummary = order.items
    .map((item) => `${item.quantity}x ${item.nameSnapshot}`)
    .join(", ")
  const createdAt = order.createdAt
    ? new Intl.DateTimeFormat("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      }).format(new Date(order.createdAt))
    : "Chưa rõ"

  return (
    <article className="overflow-hidden rounded-[2rem] border border-border/80 bg-background shadow-sm">
      <div className="grid gap-4 p-5 xl:grid-cols-[1fr_auto]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold">#{order.shortId}</h2>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs font-semibold",
                statusClassNames[order.status]
              )}
            >
              {orderStatusLabels[order.status]}
            </span>
            <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
              {paymentStatusLabels[order.paymentStatus]}
            </span>
          </div>

          <div className="mt-4 grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
            <OrderMeta label="Khách" value={order.customerName ?? "Tại quầy"} />
            <OrderMeta
              label="Nhận hàng"
              value={fulfillmentLabels[order.fulfillmentType]}
            />
            <OrderMeta
              label="Thanh toán"
              value={paymentLabels[order.paymentMethod]}
            />
            <OrderMeta label="Thời gian" value={createdAt} />
          </div>

          <div className="mt-4 grid gap-2 border-t border-border pt-4 text-sm">
            <div className="flex items-start justify-between gap-4">
              <span className="text-muted-foreground">Món</span>
              <span className="max-w-2xl text-right font-medium">
                {itemSummary || "Không có món"}
              </span>
            </div>
            {order.address ? (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Địa chỉ</span>
                <span className="max-w-2xl text-right font-medium">
                  {order.address}
                </span>
              </div>
            ) : null}
            {order.note ? (
              <div className="flex items-start justify-between gap-4">
                <span className="text-muted-foreground">Ghi chú</span>
                <span className="max-w-2xl text-right font-medium">
                  {order.note}
                </span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 xl:min-w-60 xl:items-end">
          <div className="text-left xl:text-right">
            <p className="text-sm text-muted-foreground">Tổng tiền</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatVnd(order.totalPrice)}
            </p>
          </div>
          <OrderActions
            order={order}
            isUpdating={isUpdating}
            onUpdateStatus={onUpdateStatus}
          />
        </div>
      </div>
    </article>
  )
}

function OrderMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold">{value}</p>
    </div>
  )
}

function OrderActions({ order, isUpdating, onUpdateStatus }: OrderCardProps) {
  if (order.status === "done" || order.status === "cancelled") {
    return null
  }

  return (
    <div className="flex flex-wrap gap-2 xl:justify-end">
      {order.status === "pending" ? (
        <Button
          size="sm"
          disabled={isUpdating}
          onClick={() => onUpdateStatus(order, "in_progress")}
        >
          <IconArrowRight />
          Nhận đơn
        </Button>
      ) : null}
      {order.status === "in_progress" ? (
        <Button
          size="sm"
          disabled={isUpdating}
          onClick={() => onUpdateStatus(order, "done")}
        >
          <IconCheck />
          Hoàn tất
        </Button>
      ) : null}
      <Button
        size="sm"
        variant="destructive"
        disabled={isUpdating}
        onClick={() => onUpdateStatus(order, "cancelled")}
      >
        <IconX />
        Hủy
      </Button>
    </div>
  )
}

export { AdminOrdersPageContent }
