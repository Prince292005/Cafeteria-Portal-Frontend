"use client"

import { useState } from "react"
import { motion } from "motion/react"
import { CheckCircle2, MessageSquareText, Send } from "lucide-react"
import { toast } from "sonner"
import type { FeedbackOption } from "@/lib/types"
import { submitDetailedFeedback, useFeedbackQuestions } from "@/lib/mock/store"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import Link from "next/link"

const OPTIONS: { value: FeedbackOption; label: string; emoji: string }[] = [
  { value: "VERY_POOR", label: "Very poor", emoji: "😞" },
  { value: "POOR", label: "Poor", emoji: "🙁" },
  { value: "AVERAGE", label: "Average", emoji: "😐" },
  { value: "GOOD", label: "Good", emoji: "🙂" },
  { value: "VERY_GOOD", label: "Very good", emoji: "😄" },
]

export function DetailedFeedback({ canteenId, canteenName }: { canteenId: number; canteenName: string }) {
  const { user } = useAuth()
  const questions = useFeedbackQuestions(canteenId)
  const [answers, setAnswers] = useState<Record<number, { option?: FeedbackOption; reason: string }>>({})
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  const answeredCount = Object.values(answers).filter((a) => a.option).length
  const complete = questions.length > 0 && answeredCount === questions.length

  const setOption = (qid: number, option: FeedbackOption) =>
    setAnswers((p) => ({ ...p, [qid]: { ...p[qid], option, reason: p[qid]?.reason ?? "" } }))
  const setReason = (qid: number, reason: string) =>
    setAnswers((p) => ({ ...p, [qid]: { ...p[qid], reason } }))

  const handleSubmit = async () => {
    if (!complete) {
      toast.error("Please answer every question before submitting.")
      return
    }
    setBusy(true)
    try {
      await submitDetailedFeedback(
        canteenId,
        questions.map((q) => ({
          questionId: q.id,
          option: answers[q.id].option as FeedbackOption,
          reason: answers[q.id].reason.trim(),
        })),
      )
      setSubmitted(true)
      toast.success("Detailed feedback submitted. Thank you!")
    } catch {
      toast.error("Couldn't submit feedback — please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (!user) {
    return (
      <div className="rounded-3xl border border-espresso/10 bg-card p-8 text-center">
        <MessageSquareText className="mx-auto h-8 w-8 text-terracotta" />
        <h3 className="mt-3 font-serif text-2xl font-semibold">Share detailed feedback</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-espresso/60">
          Log in as a student to rate {canteenName} across hygiene, taste, service and more.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
        >
          Log in to continue
        </Link>
      </div>
    )
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border border-forest/20 bg-forest/5 p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-forest-foreground">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-serif text-2xl font-semibold text-forest">Feedback received</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm text-espresso/60">
          Your responses feed directly into the committee&apos;s monthly report for {canteenName}.
        </p>
      </motion.div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-espresso/20 p-8 text-center text-sm text-espresso/55">
        No feedback questions have been set up for this canteen yet.
      </div>
    )
  }

  return (
    <div className="rounded-3xl border border-espresso/10 bg-card p-6 md:p-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl font-semibold">Detailed feedback</h3>
          <p className="mt-1 text-sm text-espresso/60">Answer all {questions.length} questions to submit.</p>
        </div>
        <div className="text-right">
          <p className="font-serif text-2xl font-semibold text-terracotta">
            {answeredCount}/{questions.length}
          </p>
          <p className="text-xs text-espresso/50">answered</p>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-espresso/10">
        <motion.div
          className="h-full rounded-full bg-terracotta"
          animate={{ width: `${(answeredCount / questions.length) * 100}%` }}
          transition={{ ease: "easeOut" }}
        />
      </div>

      <div className="mt-8 space-y-8">
        {questions.map((q, i) => (
          <div key={q.id} className="border-b border-espresso/8 pb-8 last:border-0 last:pb-0">
            <p className="font-medium">
              <span className="mr-2 text-terracotta">{String(i + 1).padStart(2, "0")}</span>
              {q.questionText}
            </p>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {OPTIONS.map((o) => {
                const active = answers[q.id]?.option === o.value
                return (
                  <button
                    key={o.value}
                    type="button"
                    onClick={() => setOption(q.id, o.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-2xl border px-2 py-3 text-center transition-all",
                      active
                        ? "border-terracotta bg-terracotta/10 ring-1 ring-terracotta"
                        : "border-espresso/12 hover:border-terracotta/40",
                    )}
                  >
                    <span className="text-xl">{o.emoji}</span>
                    <span className="text-[11px] font-medium leading-tight text-espresso/70">{o.label}</span>
                  </button>
                )
              })}
            </div>
            <input
              value={answers[q.id]?.reason ?? ""}
              onChange={(e) => setReason(q.id, e.target.value)}
              placeholder="Add a reason (optional)"
              className="mt-3 w-full rounded-xl border border-espresso/10 bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-terracotta"
            />
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit}
        disabled={busy}
        className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
      >
        {busy ? "Submitting..." : "Submit feedback"}
        {!busy && <Send className="h-4 w-4" />}
      </button>
    </div>
  )
}
