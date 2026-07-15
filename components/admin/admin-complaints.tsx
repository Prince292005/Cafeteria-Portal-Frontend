"use client"

import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ImageIcon, TriangleAlert, User2, Hash, Phone, Mail } from "lucide-react"
import { toast } from "sonner"
import type { ComplaintStatus } from "@/lib/types"
import {
  escalateComplaint,
  updateComplaintStatus,
  useAllComplaints,
} from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { StatusBadge } from "@/components/kit/status-badge"
import { cn } from "@/lib/utils"

const FILTERS: { key: ComplaintStatus | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "IN_PROGRESS", label: "In progress" },
  { key: "RESOLVED", label: "Resolved" },
  { key: "ESCALATED", label: "Escalated" },
]

const NEXT_STATUS: { value: ComplaintStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "RESOLVED", label: "Resolved" },
]

export function AdminComplaints() {
  const complaints = useAllComplaints()
  const [filter, setFilter] = useState<ComplaintStatus | "ALL">("ALL")

  const filtered = useMemo(
    () => (filter === "ALL" ? complaints : complaints.filter((c) => c.complaintStatus === filter)),
    [complaints, filter],
  )

  const handleStatus = async (id: number, status: ComplaintStatus) => {
    try {
      await updateComplaintStatus(id, status)
      toast.success(`Complaint marked ${status.toLowerCase().replace("_", " ")}.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update status.")
    }
  }

  return (
    <div>
      <AdminHeader title="Complaints" description="Review, respond to, and resolve student complaints." />

      <div className="mb-6 flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const count = f.key === "ALL" ? complaints.length : complaints.filter((c) => c.complaintStatus === f.key).length
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                filter === f.key
                  ? "border-espresso bg-espresso text-background"
                  : "border-espresso/15 text-espresso/70 hover:border-espresso/40",
              )}
            >
              {f.label} <span className="opacity-60">({count})</span>
            </button>
          )
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((c) => (
          <div key={c.complainId} className="rounded-3xl border border-espresso/10 bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cream px-2.5 py-0.5 text-xs font-semibold text-espresso/70">
                    {c.canteenName}
                  </span>
                  <span className="text-xs text-espresso/45">
                    #{c.complainId} · {format(new Date(c.createdAt), "d MMM yyyy")}
                  </span>
                  {c.imageKey && (
                    <span className="inline-flex items-center gap-1 text-xs text-espresso/45">
                      <ImageIcon className="h-3.5 w-3.5" /> Photo attached
                    </span>
                  )}
                </div>
                <p className="mt-2 font-semibold">{c.title}</p>
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-espresso/60">{c.description}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg bg-cream/60 px-3 py-2 text-xs text-espresso/70">
                  <span className="flex items-center gap-1.5 font-semibold text-espresso">
                    <User2 className="h-3.5 w-3.5" /> {c.studentName || "Name not on file"}
                  </span>
                  {c.studentId && (
                    <span className="flex items-center gap-1.5">
                      <Hash className="h-3.5 w-3.5" /> {c.studentId}
                    </span>
                  )}
                  {c.mobileNumber ? (
                    <a
                      href={`tel:${c.mobileNumber}`}
                      className="flex items-center gap-1.5 font-medium text-terracotta hover:underline"
                    >
                      <Phone className="h-3.5 w-3.5" /> {c.mobileNumber}
                    </a>
                  ) : null}
                  <a
                    href={`mailto:${c.emailId}`}
                    className="flex items-center gap-1.5 hover:underline"
                  >
                    <Mail className="h-3.5 w-3.5" /> {c.emailId}
                  </a>
                </div>
              </div>
              <StatusBadge status={c.complaintStatus} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-espresso/8 pt-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-espresso/45">Set status:</span>
              {NEXT_STATUS.map((s) => (
                <button
                  key={s.value}
                  onClick={() => handleStatus(c.complainId, s.value)}
                  disabled={c.complaintStatus === s.value}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                    c.complaintStatus === s.value
                      ? "border-forest bg-forest/10 text-forest"
                      : "border-espresso/15 hover:border-forest/40",
                  )}
                >
                  {s.label}
                </button>
              ))}
              <button
                onClick={async () => {
                  try {
                    await escalateComplaint(c.complainId)
                    toast.error("Complaint escalated to faculty mentor.")
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Couldn't escalate complaint.")
                  }
                }}
                disabled={c.complaintStatus === "ESCALATED"}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-destructive/25 px-3 py-1.5 text-xs font-semibold text-destructive transition-colors hover:bg-destructive/5 disabled:opacity-40"
              >
                <TriangleAlert className="h-3.5 w-3.5" /> Escalate
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-espresso/55">
            No complaints in this category.
          </div>
        )}
      </div>
    </div>
  )
}
