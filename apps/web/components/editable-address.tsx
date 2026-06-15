"use client"

import * as React from "react"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

type EditableAddressProps = {
  initialAddress: string
}

function EditableAddress({ initialAddress }: EditableAddressProps) {
  const [address, setAddress] = React.useState(initialAddress)
  const [draftAddress, setDraftAddress] = React.useState(initialAddress)
  const [isEditing, setIsEditing] = React.useState(false)

  function startEditing() {
    setDraftAddress(address)
    setIsEditing(true)
  }

  function cancelEditing() {
    setDraftAddress(address)
    setIsEditing(false)
  }

  function saveAddress() {
    const nextAddress = draftAddress.trim()

    if (!nextAddress) {
      toast.error("Địa chỉ không được để trống")
      return
    }

    setAddress(nextAddress)
    setIsEditing(false)
    toast.success("Đã cập nhật địa chỉ nhận hàng")
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-muted-foreground">Địa chỉ nhận</span>
        {isEditing ? null : (
          <Button type="button" variant="ghost" size="sm" onClick={startEditing} className="underline">
            Chỉnh sửa
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="grid gap-2">
          <textarea
            value={draftAddress}
            onChange={(event) => setDraftAddress(event.target.value)}
            rows={3}
            className="border-input bg-background min-h-20 resize-none rounded-2xl border px-3 py-2 text-sm font-medium outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Địa chỉ nhận hàng"
          />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="outline" onClick={cancelEditing}>
              Hủy
            </Button>
            <Button type="button" onClick={saveAddress}>
              Lưu địa chỉ
            </Button>
          </div>
        </div>
      ) : (
        <p className="font-medium">{address}</p>
      )}
    </div>
  )
}

export { EditableAddress }
