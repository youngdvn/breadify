import "server-only"

import { cookies } from "next/headers"

import type { Cart, Order } from "@/lib/api/types"

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"

async function getCart() {
  const response = await fetch(`${apiBaseUrl}/api/cart`, {
    cache: "no-store",
    headers: await getForwardedCookieHeaders(),
  })

  if (!response.ok) {
    throw new Error("Cannot load cart")
  }

  return (await response.json()) as Cart
}

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

async function getForwardedCookieHeaders() {
  const cookieHeader = (await cookies()).toString()

  if (!cookieHeader) {
    return undefined
  }

  return {
    Cookie: cookieHeader,
  }
}

export { getCart, getOrder }
