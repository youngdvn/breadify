"use client"

import * as React from "react"
import { IconMoon, IconSun } from "@tabler/icons-react"

import { useTheme } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

type ThemeToggleProps = {
  className?: string
}

function ThemeToggle({ className }: ThemeToggleProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const isHydrated = useIsHydrated()
  const isDark = isHydrated && resolvedTheme === "dark"
  const Icon = isDark ? IconSun : IconMoon
  const label = isDark
    ? "Chuyển sang giao diện sáng"
    : "Chuyển sang giao diện tối"

  return (
    <button
      suppressHydrationWarning
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-xl border border-border/80 bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        className
      )}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
    </button>
  )
}

function useIsHydrated() {
  return React.useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydratedSnapshot
  )
}

function subscribeToHydration() {
  return () => {}
}

function getHydratedSnapshot() {
  return true
}

function getServerHydratedSnapshot() {
  return false
}

export { ThemeToggle }
