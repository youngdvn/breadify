import type { InvoiceActionsProps } from "@/types/invoice"

function exportInvoice(props: InvoiceActionsProps) {
  const content = buildInvoiceContent(props)
  const blob = new Blob([content], {
    type: "text/html;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")

  link.href = url
  link.download = `${props.orderId}-breadify-invoice.html`
  link.click()
  URL.revokeObjectURL(url)
}

function buildInvoiceContent({
  orderId,
  customerName,
  phone,
  address,
  paymentLabel,
  paymentQrCodeUrl,
  createdTime,
  items,
  subtotal,
  shipping,
  discount,
  vat,
  total,
}: InvoiceActionsProps) {
  return `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Hóa đơn Breadify ${escapeHtml(orderId)}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 420px; margin: 24px auto; color: #1f1f1f; }
    .bill { border: 1px solid #eee; border-radius: 20px; padding: 20px; }
    h1 { font-size: 22px; margin: 0 0 12px; }
    .muted { color: #666; }
    .row { display: flex; justify-content: space-between; gap: 16px; margin: 8px 0; }
    .items { border-top: 1px solid #eee; border-bottom: 1px solid #eee; padding: 12px 0; margin: 12px 0; }
    .total { font-weight: 700; font-size: 18px; }
    .qr { text-align: center; margin-top: 18px; padding-top: 18px; border-top: 1px dashed #ddd; }
    .qr img { width: 220px; height: 220px; object-fit: contain; }
  </style>
</head>
<body>
  <main class="bill">
    <h1>Hóa đơn online - Breadify</h1>
    <p class="muted">Mã đơn: ${escapeHtml(orderId)}</p>
    <div class="row"><span>Khách hàng</span><strong>${escapeHtml(customerName)}</strong></div>
    <div class="row"><span>Số điện thoại</span><strong>${escapeHtml(phone || "-")}</strong></div>
    <div class="row"><span>Địa chỉ</span><strong>${escapeHtml(address)}</strong></div>
    <div class="row"><span>Thanh toán</span><strong>${escapeHtml(paymentLabel)}</strong></div>
    <div class="row"><span>Thời gian tạo</span><strong>${escapeHtml(createdTime)}</strong></div>
    <section class="items">
      ${items
        .map(
          (item) => `
        <div class="row">
          <span>${escapeHtml(item.name)} x${item.quantity}<br /><small class="muted">${escapeHtml(item.price)}/phần</small></span>
          <strong>${escapeHtml(item.total)}</strong>
        </div>`
        )
        .join("")}
    </section>
    <div class="row"><span>Tạm tính</span><span>${escapeHtml(subtotal)}</span></div>
    <div class="row"><span>Phí giao hàng</span><span>${escapeHtml(shipping)}</span></div>
    <div class="row"><span>Giảm giá</span><span>${escapeHtml(discount)}</span></div>
    <div class="row"><span>VAT (đã bao gồm)</span><span>${escapeHtml(vat)}</span></div>
    <div class="row total"><span>Tổng cộng</span><span>${escapeHtml(total)}</span></div>
    ${
      paymentQrCodeUrl
        ? `<section class="qr">
      <p><strong>QR chuyển khoản</strong></p>
      <img src="${escapeAttribute(paymentQrCodeUrl)}" alt="QR chuyển khoản cho đơn ${escapeAttribute(orderId)}" />
      <p class="muted">Quét mã QR để chuyển khoản đúng số tiền.</p>
    </section>`
        : ""
    }
  </main>
</body>
</html>`
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

function escapeAttribute(value: string) {
  return escapeHtml(value)
}

export { buildInvoiceContent, exportInvoice }
