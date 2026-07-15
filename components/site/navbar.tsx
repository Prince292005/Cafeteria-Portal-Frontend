"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Soup,
  User as UserIcon,
  X,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Monogram } from "@/components/kit/monogram"
import { cn } from "@/lib/utils"

const links = [
  { href: "/", label: "Home" },
  { href: "/canteens", label: "Canteens" },
  { href: "/committee", label: "Committee" },
  { href: "/complaints/new", label: "Raise a complaint" },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-espresso/10 bg-paper/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-espresso text-background">
            <Soup className="h-5 w-5" />
          </span>
          <span className="font-serif text-xl font-semibold leading-none tracking-tight">
            Cafeteria Portal
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active
                    ? "text-espresso"
                    : "text-espresso/60 hover:text-espresso",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full bg-espresso/8"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                {l.label}
              </Link>
            )
          })}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="flex items-center gap-2 rounded-full border border-espresso/15 bg-card py-1 pl-1 pr-3 transition-colors hover:border-espresso/30"
              >
                <Monogram name={user.name} className="h-7 w-7 text-xs" />
                <span className="max-w-28 truncate text-sm font-medium">{user.name.split(" ")[0]}</span>
                <ChevronDown className="h-4 w-4 text-espresso/50" />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.98 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-2xl border border-espresso/10 bg-card p-1.5 shadow-xl shadow-espresso/10"
                    >
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-espresso/50">{user.email}</p>
                      </div>
                      <div className="my-1 h-px bg-espresso/8" />
                      <MenuLink href="/dashboard" icon={<UserIcon className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                        My dashboard
                      </MenuLink>
                      {user.role === "ADMIN" && (
                        <MenuLink href="/admin" icon={<LayoutDashboard className="h-4 w-4" />} onClick={() => setMenuOpen(false)}>
                          Admin console
                        </MenuLink>
                      )}
                      <button
                        onClick={() => {
                          setMenuOpen(false)
                          logout()
                        }}
                        className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-espresso/70 transition-colors hover:text-espresso"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-espresso px-4 py-2 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
              >
                Join in
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-espresso/10 bg-paper md:hidden"
          >
            <div className="space-y-1 px-4 py-4">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-base font-medium text-espresso/80 hover:bg-espresso/5"
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-espresso/10" />
              {user ? (
                <>
                  <Link href="/dashboard" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-base font-medium">
                    My dashboard
                  </Link>
                  {user.role === "ADMIN" && (
                    <Link href="/admin" onClick={() => setOpen(false)} className="block rounded-xl px-4 py-2.5 text-base font-medium">
                      Admin console
                    </Link>
                  )}
                  <button onClick={() => { setOpen(false); logout() }} className="block w-full rounded-xl px-4 py-2.5 text-left text-base font-medium text-destructive">
                    Sign out
                  </button>
                </>
              ) : (
                <div className="flex gap-2 px-1 pt-1">
                  <Link href="/login" onClick={() => setOpen(false)} className="flex-1 rounded-full border border-espresso/20 px-4 py-2.5 text-center text-sm font-semibold">
                    Log in
                  </Link>
                  <Link href="/signup" onClick={() => setOpen(false)} className="flex-1 rounded-full bg-espresso px-4 py-2.5 text-center text-sm font-semibold text-background">
                    Join in
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
}: {
  href: string
  icon: React.ReactNode
  children: React.ReactNode
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-colors hover:bg-espresso/5"
    >
      {icon}
      {children}
    </Link>
  )
}
