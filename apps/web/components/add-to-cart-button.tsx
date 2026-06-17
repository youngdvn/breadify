"use client"

import { toast } from "sonner"
import { useState, type ComponentProps } from "react"

import { addCartItem } from "@/services/cart-client-service"
import { Button } from "@workspace/ui/components/button"

type AddToCartButtonProps = {
  productName: string
  productSlug: string
  quantityInputId?: string
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  label?: string
}

function AddToCartButton({
  productName,
  productSlug,
  quantityInputId,
  size = "sm",
  className,
  label = "Thêm",
}: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)

  async function addToCart() {
    const quantity = getQuantity(quantityInputId)

    setIsAdding(true)
    try {
      await addCartItem({
        slug: productSlug,
        quantity,
      })

      toast.success("Đã thêm vào giỏ hàng", {
        description: `${quantity} x ${productName}`,
      })
    } catch {
      toast.error("Không thể thêm vào giỏ hàng")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <Button
      type="button"
      size={size}
      className={className}
      onClick={addToCart}
      disabled={isAdding}
    >
      {isAdding ? "Đang thêm" : label}
    </Button>
  )
}

function getQuantity(quantityInputId?: string) {
  if (!quantityInputId) {
    return 1
  }

  const input = document.getElementById(quantityInputId)

  if (!(input instanceof HTMLInputElement)) {
    return 1
  }

  const quantity = Number(input.value)

  if (!Number.isFinite(quantity) || quantity < 1) {
    return 1
  }

  return Math.trunc(quantity)
}

export { AddToCartButton }
