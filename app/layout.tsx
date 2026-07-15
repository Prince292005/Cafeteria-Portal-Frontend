import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Fraunces, Inter } from "next/font/google"
import { Toaster } from "sonner"
import { AuthProvider } from "@/lib/auth-context"
import { CursorTrail } from "@/components/site/cursor-trail"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
})

export const metadata: Metadata = {
  title: "Cafeteria Portal — DAIICT Campus Dining",
  description:
    "Browse campus canteens, rate today's meals, raise complaints, and keep dining honest. The student-run cafeteria portal.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  colorScheme: "light",
  themeColor: "#f4ecdb",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} bg-background`}
    >
      <body
        className="antialiased font-sans"
        suppressHydrationWarning
      >
        <CursorTrail />

        <AuthProvider>{children}</AuthProvider>

        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "oklch(0.26 0.028 52)",
              color: "oklch(0.95 0.02 82)",
              border: "1px solid oklch(0.34 0.03 52)",
            },
          }}
        />

        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}