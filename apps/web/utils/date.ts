function formatCreatedTime(createdAt?: string) {
  if (!createdAt) {
    return "Chưa có dữ liệu"
  }

  const createdDate = new Date(createdAt)
  if (Number.isNaN(createdDate.getTime())) {
    return "Chưa có dữ liệu"
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(createdDate)
}

export { formatCreatedTime }
