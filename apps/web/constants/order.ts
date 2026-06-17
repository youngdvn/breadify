const paymentLabels = {
  cash: "Tiền mặt",
  vietqr: "Chuyển khoản",
} as const

const fulfillmentLabels = {
  pickup: "Nhận tại quầy",
  delivery: "Giao hàng",
} as const

const orderStatusLabels = {
  pending: "Mới",
  in_progress: "Đang chuẩn bị",
  done: "Hoàn tất",
  cancelled: "Đã hủy",
} as const

const paymentStatusLabels = {
  unpaid: "Chưa thu",
  pending: "Đang chờ",
  paid: "Đã thu",
  failed: "Thất bại",
  refunded: "Hoàn tiền",
} as const

export {
  fulfillmentLabels,
  orderStatusLabels,
  paymentLabels,
  paymentStatusLabels,
}
