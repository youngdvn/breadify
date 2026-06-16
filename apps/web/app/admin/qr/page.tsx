import { Button } from "@workspace/ui/components/button"

export default function AdminQrPage() {
  return (
    <section className="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          QR & Bill
        </p>
        <h1 className="mt-2 text-3xl font-semibold">Cấu hình hóa đơn</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          QR chuyển khoản hiện được build từ cấu hình ngân hàng trong Go API và
          chỉ xuất hiện trên hóa đơn online khi đơn chọn chuyển khoản.
        </p>

        <div className="mt-6 grid gap-3 text-sm">
          {[
            ["Ngân hàng", "STORE_BANK_ID"],
            ["Số tài khoản", "STORE_BANK_ACCOUNT"],
            ["Tên chủ tài khoản", "STORE_BANK_OWNER"],
            ["Nội dung", "Breadify + mã đơn"],
          ].map(([label, value]) => (
            <div
              key={label}
              className="bg-muted/60 flex items-center justify-between rounded-2xl p-4"
            >
              <span className="text-muted-foreground">{label}</span>
              <span className="font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
        <h2 className="text-xl font-semibold">Preview bill</h2>
        <div className="bg-muted mt-5 rounded-[2rem] p-5">
          <div className="bg-background mx-auto max-w-80 rounded-3xl p-5 shadow-sm">
            <p className="text-center font-semibold">Breadify Bill</p>
            <div className="my-4 grid gap-2 text-sm">
              <div className="flex justify-between">
                <span>Mã đơn</span>
                <strong>BRD-1024</strong>
              </div>
              <div className="flex justify-between">
                <span>Thanh toán</span>
                <strong>Chuyển khoản</strong>
              </div>
              <div className="flex justify-between">
                <span>Tổng</span>
                <strong>90.000đ</strong>
              </div>
            </div>
            <div className="border-border mx-auto grid size-44 place-items-center rounded-2xl border border-dashed text-center text-xs text-muted-foreground">
              QR VietQR khi xuất bill thật
            </div>
          </div>
        </div>
        <Button className="mt-5 w-full" variant="outline">
          Test xuất bill
        </Button>
      </div>
    </section>
  )
}
