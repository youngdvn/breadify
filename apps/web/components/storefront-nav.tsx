"use client"

import {
  IconBread,
  IconHome2,
  IconReceipt2,
  IconUserCircle,
} from "@tabler/icons-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@workspace/ui/lib/utils"

const navItems = [
  {
    label: "Trang chủ",
    href: "/",
    Icon: IconHome2,
  },
  {
    label: "Menu",
    href: "/menu",
    Icon: IconBread,
  },
  {
    label: "Đơn hàng",
    href: "/orders",
    Icon: IconReceipt2,
  },
  {
    label: "Tài khoản",
    href: "/account",
    Icon: IconUserCircle,
  },
]

function StorefrontNav() {
  const pathname = usePathname()

  return (
    <nav
      aria-label="Storefront navigation"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 grid shrink-0 grid-cols-4 gap-1 border-t p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur"
    >
      {navItems.map(({ label, href, Icon }) => {
        const isActive = href === "/" ? pathname === href : pathname.startsWith(href)

        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "flex min-w-0 flex-col items-center gap-1 rounded-2xl px-1.5 py-2 text-[0.68rem] font-medium transition-colors",
              isActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-5" stroke={1.8} />
            <span className="truncate">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

export { StorefrontNav }
