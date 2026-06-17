"use client"

import Link from "next/link"
import { toast } from "sonner"

import { exportInvoice } from "@/services/invoice-service"
import type { InvoiceActionsProps } from "@/types/invoice"
import { Button } from "@workspace/ui/components/button"

function InvoiceActions(props: InvoiceActionsProps) {
  const handleExportInvoice = () => {
    exportInvoice(props)
    toast.success("Đã xuất thông tin đơn hàng")
  }

  return (
    <div className="grid gap-2">
      <Button onClick={handleExportInvoice}>Xuất hóa đơn online</Button>
      <Button asChild variant="outline">
        <Link href={props.secondaryHref ?? "/orders"}>
          {props.secondaryLabel ?? "Xem đơn hàng"}
        </Link>
      </Button>
    </div>
  )
}

export { InvoiceActions }
