const paymentLabels = {
  cash: "Tiền mặt",
  vietqr: "Chuyển khoản",
} as const

const fulfillmentLabels = {
  pickup: "Nhận tại quầy",
  delivery: "Giao hàng",
} as const

export { fulfillmentLabels, paymentLabels }
