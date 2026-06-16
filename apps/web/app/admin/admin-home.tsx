"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { apiFetch } from "@/lib/api/client"
import { Button } from "@workspace/ui/components/button"
import {
  IconClipboardList,
  IconCurrencyDong,
  IconQrcode,
  IconToolsKitchen2,
} from "@tabler/icons-react"

type AdminUser = {
  username: string
  email: string
  name: string
}

function AdminHome() {
  const router = useRouter()
  const [user, setUser] = useState<AdminUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function loadUser() {
      const response = await apiFetch("/api/admin/auth/me")
      if (!isMounted) {
        return
      }

      if (!response.ok) {
        router.replace("/admin/login")
        return
      }

      setUser((await response.json()) as AdminUser)
      setIsLoading(false)
    }

    loadUser().catch(() => {
      if (isMounted) {
        router.replace("/admin/login")
      }
    })

    return () => {
      isMounted = false
    }
  }, [router])

  async function logout() {
    await apiFetch("/api/admin/auth/logout", {
      method: "POST",
    })
    toast.success("Đã đăng xuất")
    router.replace("/admin/login")
  }

  if (isLoading) {
    return (
      <section className="grid gap-5">
        <div className="bg-background border-border/80 rounded-3xl border p-6 text-sm shadow-sm">
          Đang kiểm tra phiên admin...
        </div>
      </section>
    )
  }

  return (
    <section className="grid gap-6">
      <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Admin dashboard
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              Khu quản trị Breadify
            </h1>
            <p className="text-muted-foreground mt-2 text-sm">
              Đăng nhập với {user?.username} · {user?.email}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={logout}>
            Đăng xuất
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Đơn hôm nay",
            value: "12",
            description: "Mock data trước khi có admin orders API",
            icon: IconClipboardList,
          },
          {
            label: "Doanh thu",
            value: "1.240.000đ",
            description: "Tổng đơn đã thanh toán",
            icon: IconCurrencyDong,
          },
          {
            label: "Món đang bán",
            value: "18",
            description: "Menu khả dụng trên web app",
            icon: IconToolsKitchen2,
          },
          {
            label: "QR/Bill",
            value: "VietQR",
            description: "QR hiển thị khi xuất hóa đơn",
            icon: IconQrcode,
          },
        ].map((item) => {
          const Icon = item.icon

          return (
            <div
              key={item.label}
              className="bg-background border-border/80 rounded-3xl border p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">{item.label}</p>
                  <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                </div>
                <span className="bg-primary/10 text-primary rounded-2xl p-3">
                  <Icon size={22} />
                </span>
              </div>
              <p className="text-muted-foreground mt-4 text-sm leading-6">
                {item.description}
              </p>
            </div>
          )
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold">Luồng vận hành</h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Các module admin sẽ tách khỏi UI web app customer.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {[
              "Nhận đơn realtime từ web app.",
              "Xác nhận, chuẩn bị, hoàn tất hoặc hủy đơn.",
              "Quản lý menu, trạng thái món và giá bán.",
              "Xuất lại bill có QR chuyển khoản khi cần.",
            ].map((item, index) => (
              <div
                key={item}
                className="bg-muted/60 flex items-center gap-3 rounded-2xl p-4 text-sm"
              >
                <span className="bg-background text-primary flex size-8 shrink-0 items-center justify-center rounded-xl font-semibold">
                  {index + 1}
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-background border-border/80 rounded-[2rem] border p-6 shadow-sm">
          <h2 className="text-xl font-semibold">Phase tiếp theo</h2>
          <p className="text-muted-foreground mt-2 text-sm leading-6">
            Tiếp theo nên triển khai admin orders API + admin orders desktop UI,
            vì đây là phần vận hành quan trọng nhất sau checkout.
          </p>

          <div className="mt-5 grid gap-2">
            <Button asChild>
              <Link href="/admin/orders">Mở đơn hàng</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/admin/menu">Quản lý menu</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link href="/">Về cửa hàng</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}

export { AdminHome }
