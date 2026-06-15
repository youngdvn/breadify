import Link from "next/link"
import { Toaster } from "sonner"

import { StorefrontNav } from "@/components/storefront-nav"
import { IconShoppingCart } from "@tabler/icons-react"

function AppShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-dvh justify-center overflow-hidden bg-[linear-gradient(180deg,var(--muted),var(--background))] text-foreground sm:p-4">
      <div
        data-slot="app-frame"
        className="border-border/80 bg-background flex min-h-0 w-full max-w-107.5 flex-col overflow-hidden shadow-2xl sm:rounded-[2rem] sm:border"
      >
        <header className="bg-background/95 supports-backdrop-filter:bg-background/80 flex h-16 shrink-0 items-center justify-between border-b px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold">
              B
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">
                Breadify
              </span>
              <span className="text-muted-foreground block truncate text-xs">
                Nâng tầm hương vị Việt
              </span>
            </span>
          </Link>

          <Link
            href="/cart"
            className="bg-primary/10 text-primary rounded-full px-3 py-2 text-xs font-semibold flex gap-1"
          >
            <IconShoppingCart size={16} />
          </Link>
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
