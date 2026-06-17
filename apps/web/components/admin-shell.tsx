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

import { ThemeToggle } from "@/components/theme-toggle"
import { logoutAdmin } from "@/services/admin-auth-service"
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
    await logoutAdmin()
    toast.success("Đã đăng xuất")
    router.replace("/admin/login")
    router.refresh()
  }

  if (isLoginPage) {
    return (
      <div className="flex h-dvh overflow-hidden bg-muted/40 text-foreground">
        <main className="grid min-h-0 flex-1 place-items-center overflow-y-auto px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
                  B
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold">Breadify Admin</p>
                  <p className="truncate text-sm text-muted-foreground">
                    Desktop · Tablet workspace
                  </p>
                </div>
              </div>
              <ThemeToggle />
            </div>
            <div className="rounded-[2rem] border border-border/80 bg-background shadow-xl">
              {children}
            </div>
          </div>
        </main>
        <Toaster position="top-right" richColors />
      </div>
    )
  }

  return (
    <div className="grid h-dvh grid-cols-1 overflow-hidden bg-muted/40 text-foreground md:grid-cols-[17rem_1fr]">
      <aside className="hidden min-h-0 border-r border-border/80 bg-background md:flex md:flex-col">
        <div className="flex h-[4.5rem] shrink-0 items-center gap-3 border-b px-5">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-primary-foreground">
            B
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">Breadify Admin</p>
            <p className="truncate text-xs text-muted-foreground">
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
                  "flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
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
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <IconLogout size={20} />
            <span>Đăng xuất</span>
          </button>
          <Link
            href="/"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <IconHome size={20} />
            <span>Về web app</span>
          </Link>
        </div>
      </aside>

      <section className="flex min-h-0 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:h-[4.5rem] md:px-6">
          <div className="flex items-center gap-3 md:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
              B
            </span>
            <div>
              <p className="text-sm font-semibold">Breadify Admin</p>
              <p className="text-xs text-muted-foreground">Tablet workspace</p>
            </div>
          </div>

          <div className="hidden md:block">
            <p className="text-xs tracking-wide text-muted-foreground uppercase">
              Admin workspace
            </p>
            <h1 className="text-lg font-semibold">Vận hành cửa hàng</h1>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-border/80 bg-background px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10"
            >
              Đăng xuất
            </button>
            <button
              type="button"
              className="rounded-xl border border-border/80 bg-background p-2 text-muted-foreground hover:text-foreground"
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
