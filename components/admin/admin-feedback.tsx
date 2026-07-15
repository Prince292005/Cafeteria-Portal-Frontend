"use client"

import { useMemo, useState } from "react"
import { Plus, Trash2, Pencil, MessageSquareText } from "lucide-react"
import { toast } from "sonner"
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  addFeedbackQuestion,
  deleteFeedbackQuestion,
  optionToScore,
  updateFeedbackQuestion,
  useCanteens,
  useFeedbackQuestions,
  useMonthlyResponses,
} from "@/lib/mock/store"
import type { FeedbackOption } from "@/lib/types"
import { AdminHeader } from "./admin-header"
import { Modal, fieldClass } from "@/components/kit/modal"
import { Stars } from "@/components/kit/stars"
import { cn } from "@/lib/utils"

const OPTION_LABELS: Record<FeedbackOption, string> = {
  VERY_POOR: "Very Poor",
  POOR: "Poor",
  AVERAGE: "Average",
  GOOD: "Good",
  VERY_GOOD: "Very Good",
}

const now = new Date()

export function AdminFeedback() {
  const canteens = useCanteens()
  const [canteenId, setCanteenId] = useState<number | null>(null)
  const activeId = canteenId ?? canteens[0]?.id ?? 0

  const questions = useFeedbackQuestions(activeId)
  const monthly = useMonthlyResponses(activeId, now.getFullYear(), now.getMonth())

  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [text, setText] = useState("")

  const openNew = () => {
    setEditId(null)
    setText("")
    setOpen(true)
  }
  const openEdit = (id: number, current: string) => {
    setEditId(id)
    setText(current)
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 5) return toast.error("Question is too short.")
    try {
      if (editId) {
        await updateFeedbackQuestion(editId, text.trim(), activeId)
        toast.success("Question updated.")
      } else {
        await addFeedbackQuestion(activeId, text.trim())
        toast.success("Question added.")
      }
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save question.")
    }
  }

  const summary = useMemo(() => {
    const all = monthly.flatMap((m) => m.responses)
    const avg =
      all.reduce((s, r) => s + optionToScore[r.option], 0) / Math.max(1, all.length)
    return { total: all.length, avg }
  }, [monthly])

  return (
    <div>
      <AdminHeader
        title="Feedback analytics"
        description="Review detailed feedback and manage the questions students answer for each canteen."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            <Plus className="h-4 w-4" /> Add question
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {canteens.map((c) => (
          <button
            key={c.id}
            onClick={() => setCanteenId(c.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              c.id === activeId
                ? "border-transparent bg-espresso text-background"
                : "border-espresso/15 text-espresso/70 hover:border-terracotta/50",
            )}
          >
            {c.canteenName}
          </button>
        ))}
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-espresso/10 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Responses this month
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold">{summary.total}</p>
        </div>
        <div className="rounded-3xl border border-espresso/10 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Average score
          </p>
          <p className="mt-2 font-serif text-3xl font-semibold">
            {summary.avg.toFixed(1)}
            <span className="text-lg text-espresso/40">/5</span>
          </p>
        </div>
        <div className="rounded-3xl border border-espresso/10 bg-card p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
            Overall sentiment
          </p>
          <div className="mt-3">
            <Stars value={summary.avg} />
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {monthly.length === 0 && (
          <div className="rounded-3xl border border-dashed border-espresso/20 bg-card p-10 text-center text-espresso/50">
            No feedback questions yet for this canteen. Add one to start collecting insights.
          </div>
        )}
        {monthly.map((m) => {
          const counts: Record<FeedbackOption, number> = {
            VERY_POOR: 0,
            POOR: 0,
            AVERAGE: 0,
            GOOD: 0,
            VERY_GOOD: 0,
          }
          m.responses.forEach((r) => (counts[r.option] += 1))
          const chartData = (Object.keys(OPTION_LABELS) as FeedbackOption[]).map(
            (opt) => ({ name: OPTION_LABELS[opt], value: counts[opt], opt }),
          )
          const qAvg =
            m.responses.reduce((s, r) => s + optionToScore[r.option], 0) /
            Math.max(1, m.responses.length)
          const question = questions.find((q) => q.id === m.questionId)
          const reasons = m.responses.filter((r) => r.reason).slice(0, 3)

          return (
            <div
              key={m.questionId}
              className="rounded-3xl border border-espresso/10 bg-card p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-serif text-lg font-semibold text-pretty">
                    {m.questionText}
                  </h3>
                  <p className="mt-1 text-sm text-espresso/50">
                    {m.responses.length} responses · avg {qAvg.toFixed(1)}/5
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  {question && (
                    <button
                      onClick={() => openEdit(question.id, question.questionText)}
                      className="flex h-9 w-9 items-center justify-center rounded-full text-espresso/60 transition-colors hover:bg-espresso/8"
                      aria-label="Edit question"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await deleteFeedbackQuestion(m.questionId, activeId)
                        toast.success("Question removed.")
                      } catch (err) {
                        toast.error(err instanceof Error ? err.message : "Couldn't remove question.")
                      }
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/8"
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ left: -20 }}>
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "var(--color-espresso)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "var(--color-espresso)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,0,0,0.04)" }}
                        contentStyle={{
                          borderRadius: 12,
                          border: "1px solid var(--color-border)",
                          fontSize: 12,
                        }}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={
                              i < 2
                                ? "var(--color-destructive)"
                                : i === 2
                                  ? "var(--color-turmeric)"
                                  : "var(--color-forest)"
                            }
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-espresso/50">
                    <MessageSquareText className="h-3.5 w-3.5" /> Recent comments
                  </p>
                  <div className="space-y-2">
                    {reasons.length === 0 && (
                      <p className="text-sm text-espresso/40">No written comments yet.</p>
                    )}
                    {reasons.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-espresso/10 bg-paper/50 px-4 py-2.5 text-sm text-espresso/70"
                      >
                        <span
                          className={cn(
                            "mr-2 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                            optionToScore[r.option] >= 4
                              ? "bg-forest/15 text-forest"
                              : optionToScore[r.option] === 3
                                ? "bg-turmeric/20 text-espresso"
                                : "bg-destructive/12 text-destructive",
                          )}
                        >
                          {OPTION_LABELS[r.option]}
                        </span>
                        {r.reason}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editId ? "Edit question" : "Add feedback question"}
      >
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso/50">
              Question
            </span>
            <textarea
              rows={3}
              className={fieldClass()}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. How would you rate the freshness of the food?"
            />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-background"
            >
              {editId ? "Save changes" : "Add question"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
