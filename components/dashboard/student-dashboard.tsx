"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { format } from "date-fns"
import { Flame, MessageSquareWarning, Plus, Star, Trophy, UtensilsCrossed } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEngagement, useMyComplaints } from "@/lib/mock/store"
import { StatusBadge } from "@/components/kit/status-badge"

export function StudentDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const engagement = useEngagement()
  const complaints = useMyComplaints(user?.email ?? "")

  useEffect(() => {
    if (!loading && !user) router.replace("/login")
  }, [loading, user, router])

  if (!user) return null

  const stats = [
    { icon: <Flame className="h-5 w-5" />, value: engagement.currentStreak, label: "Day streak", accent: "text-terracotta" },
    { icon: <Trophy className="h-5 w-5" />, value: engagement.totalPoints, label: "Points earned", accent: "text-turmeric" },
    { icon: <Star className="h-5 w-5" />, value: engagement.bestStreak, label: "Best streak", accent: "text-forest" },
    { icon: <MessageSquareWarning className="h-5 w-5" />, value: complaints.length, label: "Complaints filed", accent: "text-espresso" },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-terracotta">Your dashboard</p>
          <h1 className="mt-2 font-serif text-4xl font-semibold">Hi, {user.name.split(" ")[0]}.</h1>
          <p className="mt-1 text-espresso/60">Keep rating meals to grow your streak and points.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/canteens"
            className="inline-flex items-center gap-2 rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-terracotta/50"
          >
            <UtensilsCrossed className="h-4 w-4" /> Rate a meal
          </Link>
          <Link
            href="/complaints/new"
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            <Plus className="h-4 w-4" /> New complaint
          </Link>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="rounded-3xl border border-espresso/10 bg-card p-6"
          >
            <span className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cream ${s.accent}`}>
              {s.icon}
            </span>
            <p className="mt-4 font-serif text-4xl font-semibold">{s.value}</p>
            <p className="text-sm text-espresso/55">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <h2 className="font-serif text-2xl font-semibold">My complaints</h2>
        {complaints.length === 0 ? (
          <div className="mt-4 rounded-3xl border border-dashed border-espresso/20 p-12 text-center">
            <p className="font-serif text-xl">No complaints yet.</p>
            <p className="mt-1 text-sm text-espresso/55">
              Spotted a hygiene or quality issue?{" "}
              <Link href="/complaints/new" className="font-semibold text-terracotta hover:underline">
                Raise one here.
              </Link>
            </p>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {complaints.map((c) => (
              <div
                key={c.complainId}
                className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-espresso/10 bg-card p-5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-espresso/70">
                      {c.canteenName}
                    </span>
                    <span className="text-xs text-espresso/45">
                      {format(new Date(c.createdAt), "d MMM yyyy")}
                    </span>
                  </div>
                  <p className="mt-2 font-semibold">{c.title}</p>
                  <p className="mt-1 max-w-2xl text-sm leading-relaxed text-espresso/60">{c.description}</p>
                </div>
                <StatusBadge status={c.complaintStatus} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
