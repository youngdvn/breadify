import "server-only"

import { cookies } from "next/headers"

import { apiBaseUrl } from "@/services/api-client"
import type { Cart } from "@/types/cart"

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

async function getForwardedCookieHeaders() {
  const cookieHeader = (await cookies()).toString()

  if (!cookieHeader) {
    return undefined
  }

  return {
    Cookie: cookieHeader,
  }
}

export { getCart }
