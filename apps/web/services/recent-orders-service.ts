const recentOrdersStorageKey = "breadify-recent-orders"
const maxRecentOrders = 20

function addRecentOrderId(orderId: string) {
  const orderIds = getRecentOrderIds()
  const nextOrderIds = [
    orderId,
    ...orderIds.filter((currentOrderId) => currentOrderId !== orderId),
  ].slice(0, maxRecentOrders)

  window.localStorage.setItem(
    recentOrdersStorageKey,
    JSON.stringify(nextOrderIds)
  )
}

function getRecentOrderIds() {
  const rawValue = window.localStorage.getItem(recentOrdersStorageKey)
  if (!rawValue) {
    return []
  }

  try {
    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue.filter(
      (orderId): orderId is string => typeof orderId === "string"
    )
  } catch {
    return []
  }
}

export { addRecentOrderId, getRecentOrderIds }
