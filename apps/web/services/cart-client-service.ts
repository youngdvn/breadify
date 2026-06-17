import { apiFetch } from "@/services/api-client"

type AddCartItemPayload = {
  slug: string
  quantity: number
}

type UpdateCartItemPayload = {
  quantity: number
  note: string
}

async function addCartItem(payload: AddCartItemPayload) {
  const response = await apiFetch("/api/cart/items", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Cannot add cart item")
  }
}

async function updateCartItem(itemId: string, payload: UpdateCartItemPayload) {
  const response = await apiFetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error("Cannot update cart item")
  }
}

async function deleteCartItem(itemId: string) {
  const response = await apiFetch(`/api/cart/items/${itemId}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Cannot delete cart item")
  }
}

export { addCartItem, deleteCartItem, updateCartItem }
