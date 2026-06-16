import Link from "next/link"

import { AdminLoginForm } from "@/app/admin/login/admin-login-form"
import { Button } from "@workspace/ui/components/button"

export default function AdminLoginPage() {
  return (
    <section className="grid gap-6 p-6">
      <div>
        <p className="text-muted-foreground text-xs uppercase tracking-wide">
          Admin access
        </p>
        <h1 className="mt-2 text-2xl font-semibold">Đăng nhập quản trị</h1>
        <p className="text-muted-foreground mt-2 text-sm leading-6">
          Nhập username admin để nhận OTP qua email. OTP thay thế mật khẩu
          trong luồng đăng nhập.
        </p>
      </div>

      <AdminLoginForm />

      <Button asChild variant="outline">
        <Link href="/">Về cửa hàng</Link>
      </Button>
    </section>
  )
}
