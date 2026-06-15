"use client"

import { toast } from "sonner"
import type { ComponentProps } from "react"

import { Button } from "@workspace/ui/components/button"

type AddToCartButtonProps = {
  productName: string
  quantityInputId?: string
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  label?: string
}

function AddToCartButton({
  productName,
  quantityInputId,
  size = "sm",
  className,
  label = "Thêm",
}: AddToCartButtonProps) {
  function addToCart() {
    const quantity = getQuantity(quantityInputId)

    toast.success("Đã thêm vào giỏ hàng", {
      description: `${quantity} x ${productName}`,
    })
  }

  return (
    <Button type="button" size={size} className={className} onClick={addToCart}>
      {label}
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
