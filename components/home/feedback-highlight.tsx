"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Flame, LogIn, MessageSquareHeart, Trophy, Zap } from "lucide-react"
import { QuickFeedback } from "@/components/feedback/quick-feedback"
import { Reveal } from "@/components/kit/reveal"
import { useCanteens } from "@/lib/mock/store"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const perks = [
  {
    icon: Zap,
    title: "Five-second ratings",
    body: "One tap after your meal. No forms, no friction.",
  },
  {
    icon: Flame,
    title: "Build a streak",
    body: "Rate daily to keep your streak burning and climb the board.",
  },
  {
    icon: Trophy,
    title: "Earn points",
    body: "Every rating earns points that unlock campus perks.",
  },
]

export function FeedbackHighlight() {
  const canteens = useCanteens()
  const { user } = useAuth()
  const [selectedId, setSelectedId] = useState<number | null>(null)

  // Default to the first canteen once the list loads, but let the user
  // switch to whichever canteen they actually ate at.
  useEffect(() => {
    if (selectedId === null && canteens.length > 0) {
      setSelectedId(canteens[0].id)
    }
  }, [canteens, selectedId])

  const selected = canteens.find((c) => c.id === selectedId) ?? canteens[0]

  return (
    <section className="bg-espresso py-20 text-background">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <Reveal>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-turmeric">
              <MessageSquareHeart className="h-4 w-4" /> Your voice matters
            </p>
            <h2 className="mt-3 text-balance font-serif text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl">
              Feedback that feels like a game, not a chore.
            </h2>
            <p className="mt-4 max-w-md text-pretty text-lg leading-relaxed text-background/65">
              Rate meals the moment you finish them. Keep a daily streak, rack up
              points, and watch your input shape what campus canteens serve next.
            </p>
          </Reveal>

          <div className="mt-8 space-y-4">
            {perks.map((p, i) => (
              <Reveal key={p.title} delay={i * 0.08}>
                <div className="flex items-start gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-turmeric text-espresso">
                    <p.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-semibold">{p.title}</h3>
                    <p className="text-sm text-background/60">{p.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] bg-paper p-2 text-foreground shadow-2xl shadow-black/30">
            {!user ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-3xl border border-forest/20 bg-forest/5 p-6 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-forest-foreground">
                  <LogIn className="h-5 w-5" />
                </span>
                <p className="font-semibold text-forest">Log in to rate today&apos;s meal</p>
                <p className="max-w-xs text-sm text-espresso/60">
                  Sign in with your student account to rate any canteen and keep your streak going.
                </p>
                <Link
                  href="/login"
                  className="mt-1 rounded-full bg-forest px-5 py-2 text-sm font-semibold text-forest-foreground transition-colors hover:bg-forest/90"
                >
                  Sign in
                </Link>
              </div>
            ) : canteens.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-3xl border border-forest/20 bg-forest/5 p-6 text-sm text-espresso/50">
                Loading canteens...
              </div>
            ) : (
              <div className="rounded-3xl border border-forest/20 bg-forest/5 p-4">
                <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                  Which canteen did you eat at?
                </p>
                <div className="flex flex-wrap gap-2">
                  {canteens.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        c.id === selected?.id
                          ? "border-forest bg-forest text-forest-foreground"
                          : "border-espresso/15 bg-card text-espresso/70 hover:border-forest/40",
                      )}
                    >
                      {c.canteenName}
                    </button>
                  ))}
                </div>
                {selected && (
                  <QuickFeedback
                    key={selected.id}
                    canteenId={selected.id}
                    canteenName={selected.canteenName}
                    className="mt-3 border-none bg-transparent p-2"
                  />
                )}
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  )
}

