"use client"

import * as React from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
}

const storageKey = "breadify-theme"
const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [theme, setThemeState] = React.useState<Theme>(getInitialTheme)
  const [resolvedTheme, setResolvedTheme] =
    React.useState<ResolvedTheme>(getInitialResolvedTheme)

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeState(nextTheme)
    window.localStorage.setItem(storageKey, nextTheme)
  }, [])

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

    function applyTheme() {
      const nextResolvedTheme =
        theme === "system" ? (mediaQuery.matches ? "dark" : "light") : theme

      document.documentElement.classList.toggle(
        "dark",
        nextResolvedTheme === "dark"
      )
      document.documentElement.style.colorScheme = nextResolvedTheme
      setResolvedTheme(nextResolvedTheme)
    }

    applyTheme()
    mediaQuery.addEventListener("change", applyTheme)

    return () => {
      mediaQuery.removeEventListener("change", applyTheme)
    }
  }, [theme])

  const value = React.useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return (
    <ThemeContext.Provider value={value}>
      <ThemeHotkey />
      {children}
    </ThemeContext.Provider>
  )
}

function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider")
  }
  return context
}

function isTheme(value: string | null): value is Theme {
  return value === "light" || value === "dark" || value === "system"
}

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "system"
  }

  const storedTheme = window.localStorage.getItem(storageKey)
  if (isTheme(storedTheme)) {
    return storedTheme
  }

  return "system"
}

function getInitialResolvedTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "light"
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider, useTheme }
