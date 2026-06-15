"use client"

import Link from "next/link"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

type InvoiceItem = {
  name: string
  quantity: number
  price: string
  total: string
}

type InvoiceActionsProps = {
  orderId: string
  customerName: string
  phone: string
  address: string
  paymentLabel: string
  pickupTime: string
  items: InvoiceItem[]
  subtotal: string
  shipping: string
  discount: string
  total: string
}

function buildInvoiceContent({
  orderId,
  customerName,
  phone,
  address,
  paymentLabel,
  pickupTime,
  items,
  subtotal,
  shipping,
  discount,
  total,
}: InvoiceActionsProps) {
  return [
    "HÓA ĐƠN ONLINE - BREADIFY",
    `Mã đơn: ${orderId}`,
    `Khách hàng: ${customerName}`,
    `Số điện thoại: ${phone}`,
    `Địa chỉ: ${address}`,
    `Thanh toán: ${paymentLabel}`,
    `Thời gian nhận: ${pickupTime}`,
    "",
    "Sản phẩm:",
    ...items.map(
      (item) =>
        `- ${item.name} x${item.quantity} | Đơn giá: ${item.price} | Thành tiền: ${item.total}`
    ),
    "",
    `Tạm tính: ${subtotal}`,
    `Phí giao hàng: ${shipping}`,
    `Giảm giá: ${discount}`,
    `Tổng cộng: ${total}`,
  ].join("\n")
}

function InvoiceActions(props: InvoiceActionsProps) {
  const handleExportInvoice = () => {
    const content = buildInvoiceContent(props)
    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `${props.orderId}-breadify-invoice.txt`
    link.click()
    URL.revokeObjectURL(url)

    toast.success("Đã xuất thông tin đơn hàng")
  }

  return (
    <div className="grid gap-2">
      <Button onClick={handleExportInvoice}>Xuất hóa đơn online</Button>
      <Button asChild variant="outline">
        <Link href="/orders">Xem đơn hàng</Link>
      </Button>
    </div>
  )
}

export { InvoiceActions }
