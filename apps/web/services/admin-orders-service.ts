import { apiFetch } from "@/services/api-client"
import type { Order, OrderStatus } from "@/types/order"

type AdminOrderListResponse = {
  items: Order[]
}

async function getAdminOrders(status?: OrderStatus | "all") {
  const searchParams = new URLSearchParams()
  if (status && status !== "all") {
    searchParams.set("status", status)
  }

  const query = searchParams.toString()
  const response = await apiFetch(
    `/api/admin/orders${query ? `?${query}` : ""}`
  )

  if (!response.ok) {
    throw new Error("Cannot load admin orders")
  }

  return (await response.json()) as AdminOrderListResponse
}

async function updateAdminOrderStatus(orderId: string, status: OrderStatus) {
  const response = await apiFetch(`/api/admin/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  })

  if (!response.ok) {
    throw new Error("Cannot update order status")
  }

  return (await response.json()) as Order
}

export { getAdminOrders, updateAdminOrderStatus }
