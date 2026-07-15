"use client"

import { useState } from "react"
import { Sparkles, FileText, Download, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { reportApi } from "@/lib/api"
import { useCanteens } from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { cn } from "@/lib/utils"

const now = new Date()
const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number)
  return new Date(y, m - 1, 1).toLocaleString("en-US", { month: "long", year: "numeric" })
}

function exportReport(month: string, scopeLabel: string, text: string) {
  const blob = new Blob([`Cafeteria Portal — Monthly Report\n${scopeLabel} — ${monthLabel(month)}\n\n${text}`], {
    type: "text/plain;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `cafeteria-report-${scopeLabel.replace(/\s+/g, "-").toLowerCase()}-${month}.txt`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
  toast.success("Report exported.")
}

export function AdminReports() {
  const canteens = useCanteens()
  const [month, setMonth] = useState(defaultMonth)
  const [canteenId, setCanteenId] = useState<number | "all">("all")
  const [report, setReport] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const activeCanteen = canteenId === "all" ? null : canteens.find((c) => c.id === canteenId) ?? null
  const scopeLabel = activeCanteen ? activeCanteen.canteenName : "All canteens"

  const generate = async () => {
    setLoading(true)
    setReport(null)
    try {
      const text = await reportApi.getLLMReport(month, activeCanteen?.id)
      setReport(text)
      toast.success("Report generated.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't generate the report.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <AdminHeader
        title="AI monthly reports"
        description={
          activeCanteen
            ? `A focused AI report for ${activeCanteen.canteenName}, with suggestions based on its own feedback and complaints.`
            : "An AI-authored summary of every canteen's feedback and complaints for the selected month, generated on demand."
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => {
              setCanteenId("all")
              setReport(null)
            }}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              canteenId === "all"
                ? "border-transparent bg-espresso text-background"
                : "border-espresso/15 text-espresso/70 hover:border-terracotta/50",
            )}
          >
            All canteens
          </button>
          {canteens.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCanteenId(c.id)
                setReport(null)
              }}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                canteenId === c.id
                  ? "border-transparent bg-espresso text-background"
                  : "border-espresso/15 text-espresso/70 hover:border-terracotta/50",
              )}
            >
              {c.canteenName}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className="text-xs font-semibold uppercase tracking-wide text-espresso/50">
          Month
        </label>
        <input
          type="month"
          value={month}
          onChange={(e) => {
            setMonth(e.target.value)
            setReport(null)
          }}
          max={defaultMonth}
          className="rounded-full border border-espresso/15 bg-card px-4 py-2 text-sm outline-none focus:border-terracotta"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <div className="rounded-3xl border border-espresso/10 bg-gradient-to-br from-espresso to-[#2a1c14] p-7 text-background">
          <Sparkles className="h-8 w-8 text-turmeric" />
          <h3 className="mt-4 font-serif text-2xl font-semibold">{scopeLabel}</h3>
          <p className="mt-2 text-sm leading-relaxed text-background/70">
            {activeCanteen
              ? `Generates a focused report for ${activeCanteen.canteenName} with specific suggestions, based on ${monthLabel(month)}'s feedback and complaints.`
              : `Generates one consolidated report across every canteen, combining feedback responses and complaints logged in ${monthLabel(month)}.`}
          </p>
          <button
            onClick={generate}
            disabled={loading}
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-turmeric px-6 py-3 text-sm font-semibold text-espresso transition-transform hover:scale-[1.02] disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Analysing…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Generate report
              </>
            )}
          </button>
        </div>

        <div className="rounded-3xl border border-espresso/10 bg-card p-7">
          {!report && !loading && (
            <div className="flex h-full min-h-64 flex-col items-center justify-center text-center text-espresso/40">
              <FileText className="h-10 w-10" />
              <p className="mt-3 max-w-xs text-sm">
                Your generated report will appear here, covering {activeCanteen ? activeCanteen.canteenName : "every canteen"} for the
                selected month.
              </p>
            </div>
          )}
          {loading && (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-4 animate-pulse rounded-full bg-espresso/8"
                  style={{ width: `${90 - i * 6}%` }}
                />
              ))}
            </div>
          )}
          {report && !loading && (
            <article className="space-y-4">
              <header className="flex items-center justify-between border-b border-espresso/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-terracotta">
                    {monthLabel(month)} · Performance report
                  </p>
                  <h3 className="mt-1 font-serif text-2xl font-semibold">{scopeLabel}</h3>
                </div>
                <button
                  onClick={() => exportReport(month, scopeLabel, report)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-espresso/15 px-4 py-2 text-xs font-semibold transition-colors hover:border-terracotta/50"
                >
                  <Download className="h-3.5 w-3.5" /> Export
                </button>
              </header>
              <div className="whitespace-pre-wrap text-[15px] leading-relaxed text-espresso/80">
                {report}
              </div>
            </article>
          )}
        </div>
      </div>
    </div>
  )
}
