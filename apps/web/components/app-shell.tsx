"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Toaster } from "sonner"

import { AdminShell } from "@/components/admin-shell"
import { StorefrontNav } from "@/components/storefront-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { IconShoppingCart } from "@tabler/icons-react"

function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return <AdminShell>{children}</AdminShell>
  }

  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[linear-gradient(180deg,var(--muted),var(--background))] text-foreground sm:p-4">
      <div
        data-slot="app-frame"
        className="flex min-h-0 w-full max-w-107.5 flex-col overflow-hidden border-border/80 bg-background shadow-2xl sm:rounded-[2rem] sm:border"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur supports-backdrop-filter:bg-background/80">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground">
              B
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                Breadify
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                Nâng tầm hương vị Việt
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/cart"
              className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
              aria-label="Giỏ hàng"
            >
              <IconShoppingCart size={18} />
            </Link>
          </div>
        </header>

        <main className="scrollbar-none min-h-0 flex-1 overflow-y-auto">
          {children}
        </main>

        <StorefrontNav />
        <Toaster
          position="top-center"
          richColors
          toastOptions={{
            className: "font-sans",
          }}
        />
      </div>
    </div>
  )
}

export { AppShell }
