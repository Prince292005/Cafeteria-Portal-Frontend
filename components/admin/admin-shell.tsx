"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  LayoutDashboard,
  Loader2,
  LogOut,
  Megaphone,
  MessageSquareWarning,
  Menu,
  Store,
  Users,
  UtensilsCrossed,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/canteens", label: "Canteens", icon: Store },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/feedback", label: "Feedback", icon: BarChart3 },
  { href: "/admin/committee", label: "Committee", icon: Users },
  { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
  { href: "/admin/reports", label: "Reports", icon: BarChart3 },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) router.replace("/login")
  }, [loading, user, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-espresso/40" />
      </div>
    )
  }

  if (!user || user.role !== "ADMIN") return null

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-[260px] transform border-r border-espresso/10 bg-espresso text-background transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-full flex-col p-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background/15">
              <UtensilsCrossed className="h-4 w-4" />
            </span>
            <span className="font-serif text-lg font-semibold">Cafeteria Portal</span>
          </Link>
          <p className="mt-1 pl-11 text-xs text-background/50">Committee console</p>

          <nav className="mt-8 flex-1 space-y-1">
            {NAV.map((item) => {
              const active = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-background/12 text-background"
                      : "text-background/60 hover:bg-background/8 hover:text-background",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="border-t border-background/10 pt-4">
            <div className="mb-3 px-3">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-background/50">{user.email}</p>
            </div>
            <button
              onClick={() => {
                logout()
                router.push("/")
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-background/60 transition-colors hover:bg-background/8 hover:text-background"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-espresso/40 lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      {/* Main */}
      <div className="flex min-w-0 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-espresso/10 bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <button onClick={() => setOpen(true)} aria-label="Open menu">
            <Menu className="h-6 w-6" />
          </button>
          <span className="font-serif text-lg font-semibold">Committee console</span>
        </header>
        <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  )
}
