"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  IconBell,
  IconClipboardList,
  IconHome,
  IconLayoutDashboard,
  IconLogout,
  IconQrcode,
  IconToolsKitchen2,
} from "@tabler/icons-react"
import { toast, Toaster } from "sonner"

import { apiFetch } from "@/lib/api/client"
import { cn } from "@workspace/ui/lib/utils"

const adminNavItems = [
  {
    href: "/admin",
    label: "Tổng quan",
    icon: IconLayoutDashboard,
  },
  {
    href: "/admin/orders",
    label: "Đơn hàng",
    icon: IconClipboardList,
  },
  {
    href: "/admin/menu",
    label: "Menu",
    icon: IconToolsKitchen2,
  },
  {
    href: "/admin/qr",
    label: "QR & Bill",
    icon: IconQrcode,
  },
]

function AdminShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const router = useRouter()
  const isLoginPage = pathname === "/admin/login"

  async function logout() {
    await apiFetch("/api/admin/auth/logout", {
      method: "POST",
    })
    toast.success("Đã đăng xuất")
    router.replace("/admin/login")
    router.refresh()
  }

  if (isLoginPage) {
    return (
      <div className="bg-muted/40 flex h-dvh overflow-hidden text-foreground">
        <main className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center gap-3">
              <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-2xl text-sm font-semibold">
                B
              </span>
              <div>
                <p className="font-semibold">Breadify Admin</p>
                <p className="text-muted-foreground text-sm">
                  Desktop · Tablet workspace
                </p>
              </div>
            </div>
            <div className="bg-background border-border/80 rounded-[2rem] border shadow-xl">
              {children}
            </div>
          </div>
        </main>
        <Toaster position="top-right" richColors />
      </div>
    )
  }

  return (
    <div className="bg-muted/40 grid h-dvh grid-cols-1 overflow-hidden text-foreground md:grid-cols-[17rem_1fr]">
      <aside className="bg-background border-border/80 hidden min-h-0 border-r md:flex md:flex-col">
        <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b px-5">
          <span className="bg-primary text-primary-foreground flex size-11 items-center justify-center rounded-2xl text-sm font-semibold">
            B
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">Breadify Admin</p>
            <p className="text-muted-foreground truncate text-xs">
              Quản lý cửa hàng
            </p>
          </div>
        </div>

        <nav className="grid gap-1 p-3">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === item.href
                : pathname.startsWith(item.href)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive && "bg-primary/10 text-primary hover:text-primary"
                )}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto grid gap-1 border-t p-3">
          <button
            type="button"
            onClick={logout}
            className="text-destructive hover:bg-destructive/10 flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium transition-colors"
          >
            <IconLogout size={20} />
            <span>Đăng xuất</span>
          </button>
          <Link
            href="/"
            className="text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <IconHome size={20} />
            <span>Về web app</span>
          </Link>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="bg-background/95 supports-backdrop-filter:bg-background/80 flex h-16 shrink-0 items-center justify-between border-b px-4 backdrop-blur md:h-[4.5rem] md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-xl text-sm font-semibold">
              B
            </span>
            <div>
              <p className="text-sm font-semibold">Breadify Admin</p>
              <p className="text-muted-foreground text-xs">Tablet workspace</p>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
              Admin workspace
            </p>
            <h1 className="text-lg font-semibold">Vận hành cửa hàng</h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="border-border/80 bg-background text-destructive hover:bg-destructive/10 rounded-xl border px-3 py-2 text-sm font-medium"
            >
              Đăng xuất
            </button>
            <button
              type="button"
              className="border-border/80 bg-background text-muted-foreground hover:text-foreground rounded-xl border p-2"
              aria-label="Thông báo"
            >
              <IconBell size={20} />
            </button>
          </div>
        </header>

        <main className="scrollbar-none min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </section>

      <Toaster position="top-right" richColors />
    </div>
  )
}

export { AdminShell }
