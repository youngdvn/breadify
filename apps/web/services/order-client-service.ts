import { apiFetch } from "@/services/api-client"
import type { CreateOrderPayload, Order } from "@/types/order"

async function createOrder(payload: CreateOrderPayload) {
  const response = await apiFetch("/api/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Cannot create order")
  }

  return (await response.json()) as Order
}

async function getOrderClient(orderId: string) {
  const response = await apiFetch(`/api/orders/${orderId}`)

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Cannot load order")
  }

  return (await response.json()) as Order
}

export { createOrder, getOrderClient }
