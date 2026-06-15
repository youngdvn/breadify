import type { Metadata, Viewport } from "next"
import { Geist_Mono, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import { AppShell } from "@/components/app-shell"
import { PwaProvider } from "@/components/pwa-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@workspace/ui/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "Breadify",
    template: "%s | Breadify",
  },
  description: "Breadify web application",
  applicationName: "Breadify",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Breadify",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#182024" },
  ],
}

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-dvh overflow-hidden bg-background text-foreground",
        "antialiased",
        fontMono.variable,
        "font-sans",
        spaceGrotesk.variable
      )}
    >
      <body className="h-dvh overflow-hidden">
        <ThemeProvider>
          <PwaProvider />
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  )
}
