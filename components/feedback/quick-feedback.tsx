"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { CheckCircle2, Flame, Loader2, Star, Trophy } from "lucide-react"
import { toast } from "sonner"
import { submitQuickFeedback, useEngagement } from "@/lib/mock/store"
import { cn } from "@/lib/utils"

const TAGS = ["Taste", "Hygiene", "Portion", "Service", "Value"]

export function QuickFeedback({
  canteenId,
  canteenName,
  className,
}: {
  canteenId: number
  canteenName?: string
  className?: string
}) {
  const engagement = useEngagement()
  const [hover, setHover] = useState(0)
  const [rating, setRating] = useState(0)
  const [tag, setTag] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleRate = async (value: number) => {
    if (submitting || submitted) return
    setRating(value)
    setSubmitting(true)
    try {
      const result = await submitQuickFeedback(canteenId, value, tag ?? undefined)
      setSubmitted(true)
      if (result.currentStreak > 1) {
        toast.success(`${result.currentStreak}-day streak! Feedback recorded.`)
      } else {
        toast.success("Thanks for the feedback!")
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit feedback — please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-3xl border border-forest/20 bg-forest/5 p-6",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-forest">
            How was today&apos;s meal?
          </h3>
          <p className="mt-1 text-sm text-espresso/60">
            {canteenName ? `Rate ${canteenName} — ` : ""}one tap, five seconds.
          </p>
        </div>
        <div className="flex items-center gap-1.5 rounded-full border border-turmeric/40 bg-turmeric/15 px-3 py-1.5">
          <Flame className="h-4 w-4 text-terracotta" />
          <span className="text-sm font-bold text-espresso">{engagement.currentStreak}</span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {submitted ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 rounded-2xl border border-forest/20 bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-forest text-forest-foreground">
                <CheckCircle2 className="h-6 w-6" />
              </span>
              <div>
                <p className="font-semibold text-forest">Feedback recorded</p>
                <p className="text-sm text-espresso/60">
                  You&apos;re on a {engagement.currentStreak}-day streak.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <Stat icon={<Flame className="h-4 w-4" />} value={engagement.currentStreak} label="Streak" />
              <Stat icon={<Trophy className="h-4 w-4" />} value={engagement.totalPoints} label="Points" />
              <Stat icon={<Star className="h-4 w-4" />} value={engagement.bestStreak} label="Best" />
            </div>
          </motion.div>
        ) : (
          <motion.div key="form" exit={{ opacity: 0 }}>
            <div className="mt-6 flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={submitting}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => handleRate(star)}
                  className="transition-transform hover:scale-125 disabled:opacity-50"
                  aria-label={`Rate ${star} of 5`}
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition-colors",
                      star <= (hover || rating)
                        ? "fill-turmeric text-turmeric"
                        : "fill-none text-espresso/25",
                    )}
                  />
                </button>
              ))}
              {submitting && <Loader2 className="ml-2 h-5 w-5 animate-spin text-forest" />}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTag((p) => (p === t ? null : t))}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    tag === t
                      ? "border-forest bg-forest text-forest-foreground"
                      : "border-espresso/15 text-espresso/70 hover:border-forest/40",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
            <p className="mt-3 text-xs text-espresso/45">
              Tag is optional — tap a star to submit and keep your streak alive.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="rounded-xl bg-forest/8 p-3">
      <div className="flex items-center justify-center gap-1 text-forest">{icon}</div>
      <p className="mt-1 font-serif text-xl font-semibold">{value}</p>
      <p className="text-xs text-espresso/55">{label}</p>
    </div>
  )
}
