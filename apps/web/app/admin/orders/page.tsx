import { Button } from "@workspace/ui/components/button"

const mockOrders = [
  {
    id: "BRD-1024",
    customer: "Nguyễn Minh",
    items: "2 bánh mì đặc biệt",
    total: "90.000đ",
    status: "Đang chuẩn bị",
    payment: "Chuyển khoản",
  },
  {
    id: "BRD-1025",
    customer: "Nhận tại quầy",
    items: "1 bánh mì bò nướng",
    total: "45.000đ",
    status: "Mới",
    payment: "Tiền mặt",
  },
  {
    id: "BRD-1026",
    customer: "Trần Hà",
    items: "3 bánh mì que",
    total: "80.000đ",
    status: "Hoàn tất",
    payment: "Chuyển khoản",
  },
]

export default function AdminOrdersPage() {
  return (
    <section className="grid gap-6">
      <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Admin orders
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Đơn hàng</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Bản desktop/tablet để vận hành đơn tại quầy.
            </p>
          </div>
          <Button variant="outline">Làm mới</Button>
        </div>
      </div>

      <div className="bg-background border-border/80 overflow-hidden rounded-[2rem] border shadow-sm">
        <div className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-5 py-4 text-sm font-semibold">
          <span>Mã đơn</span>
          <span>Khách</span>
          <span>Món</span>
          <span>Tổng</span>
          <span>Thanh toán</span>
          <span>Trạng thái</span>
        </div>
        {mockOrders.map((order) => (
          <div
            key={order.id}
            className="grid grid-cols-[1fr_1.2fr_1fr_1fr_1fr_1fr] gap-4 border-b px-5 py-4 text-sm last:border-b-0"
          >
            <span className="font-semibold">{order.id}</span>
            <span>{order.customer}</span>
            <span className="text-muted-foreground">{order.items}</span>
            <span>{order.total}</span>
            <span>{order.payment}</span>
            <span className="text-primary font-medium">{order.status}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
