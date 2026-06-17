import "server-only"

import { apiBaseUrl } from "@/services/api-client"
import type { Order } from "@/types/order"

async function getOrder(orderId: string) {
  const response = await fetch(`${apiBaseUrl}/api/orders/${orderId}`, {
    cache: "no-store",
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error("Cannot load order")
  }

  return (await response.json()) as Order
}

export { getOrder }
