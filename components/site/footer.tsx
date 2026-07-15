"use client"

import Link from "next/link"
import { Soup } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const exploreCol = {
  title: "Explore",
  links: [
    { href: "/canteens", label: "All canteens" },
    { href: "/committee", label: "Food committee" },
    { href: "/#announcements", label: "Announcements" },
  ],
}

const adminCol = {
  title: "Committee",
  links: [
    { href: "/admin", label: "Admin console" },
    { href: "/admin/reports", label: "Monthly reports" },
    { href: "/admin/feedback", label: "Feedback analytics" },
  ],
}

export function Footer() {
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  const yourVoiceCol = {
    title: "Your voice",
    links: user
      ? [
          { href: "/complaints/new", label: "Raise a complaint" },
          { href: "/dashboard", label: "My dashboard" },
        ]
      : [
          { href: "/complaints/new", label: "Raise a complaint" },
          { href: "/login", label: "Log in" },
        ],
  }

  const cols = isAdmin ? [exploreCol, yourVoiceCol, adminCol] : [exploreCol, yourVoiceCol]

  return (
    <footer className="mt-24 bg-espresso text-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className={cn(
            "grid gap-12",
            isAdmin ? "md:grid-cols-[1.5fr_1fr_1fr_1fr]" : "md:grid-cols-[1.5fr_1fr_1fr]",
          )}
        >
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-turmeric text-espresso">
                <Soup className="h-5 w-5" />
              </span>
              <span className="font-serif text-xl font-semibold">Cafeteria Portal</span>
            </div>
            <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-background/60">
              The student-run cafeteria portal. Browse canteens, rate today&apos;s
              meals, and keep campus dining honest — one plate at a time.
            </p>
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="text-xs font-semibold uppercase tracking-widest text-turmeric">
                {c.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-sm text-background/70 transition-colors hover:text-background"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-background/15 pt-6 sm:flex-row sm:items-center">
          <p className="text-xs text-background/50">
            © {new Date().getFullYear()} Cafeteria Portal · Campus Food Committee. All rights reserved.
          </p>
          <p className="font-serif text-sm italic text-background/60">
            Good food, honestly served.
          </p>
        </div>
      </div>
    </footer>
  )
}
