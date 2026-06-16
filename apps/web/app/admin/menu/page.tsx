import { Button } from "@workspace/ui/components/button"

const mockItems = [
  {
    name: "Bánh mì đặc biệt",
    category: "Signature",
    price: "45.000đ",
    status: "Đang bán",
  },
  {
    name: "Bánh mì bò nướng",
    category: "Nướng",
    price: "45.000đ",
    status: "Đang bán",
  },
  {
    name: "Bánh mì que",
    category: "Ăn nhẹ",
    price: "20.000đ",
    status: "Tạm hết",
  },
]

export default function AdminMenuPage() {
  return (
    <section className="grid gap-6">
      <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Admin menu
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Quản lý menu</h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Placeholder desktop UI trước khi nối CRUD menu API.
            </p>
          </div>
          <Button>Thêm món</Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {mockItems.map((item) => (
          <div
            key={item.name}
            className="bg-background border-border/80 rounded-[2rem] border p-5 shadow-sm"
          >
            <div className="bg-muted h-32 rounded-3xl" />
            <div className="mt-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.category}
                </p>
              </div>
              <span className="text-primary font-semibold">{item.price}</span>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="bg-primary/10 text-primary rounded-full px-3 py-1 text-xs font-semibold">
                {item.status}
              </span>
              <Button variant="outline" size="sm">
                Sửa
              </Button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
