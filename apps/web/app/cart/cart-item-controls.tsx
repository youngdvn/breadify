"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  deleteCartItem,
  updateCartItem,
} from "@/services/cart-client-service"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"

type CartItemControlsProps = {
  itemId: string
  initialQuantity: number
  initialNote?: string
}

function CartItemControls({
  itemId,
  initialQuantity,
  initialNote = "",
}: CartItemControlsProps) {
  const router = useRouter()
  const [quantity, setQuantity] = useState(initialQuantity)
  const [note, setNote] = useState(initialNote)
  const [isSaving, setIsSaving] = useState(false)

  async function updateItem() {
    setIsSaving(true)
    try {
      await updateCartItem(itemId, {
        quantity,
        note,
      })

      toast.success("Đã cập nhật giỏ hàng")
      router.refresh()
    } catch {
      toast.error("Không thể cập nhật món")
    } finally {
      setIsSaving(false)
    }
  }

  async function deleteItem() {
    setIsSaving(true)
    try {
      await deleteCartItem(itemId)

      toast.success("Đã xóa món khỏi giỏ")
      router.refresh()
    } catch {
      toast.error("Không thể xóa món")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="mt-3 grid gap-2">
      <div className="flex items-center gap-2">
        <label
          htmlFor={`quantity-${itemId}`}
          className="text-muted-foreground text-xs font-medium"
        >
          SL
        </label>
        <Input
          id={`quantity-${itemId}`}
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
          className="h-8 w-16 text-center text-sm font-medium [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={updateItem}
          disabled={isSaving}
        >
          Lưu
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={deleteItem}
          disabled={isSaving}
        >
          Xóa
        </Button>
      </div>

      <Input
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Ghi chú món"
        aria-label="Ghi chú món"
        className="h-9 text-sm"
      />
    </div>
  )
}

export { CartItemControls }
