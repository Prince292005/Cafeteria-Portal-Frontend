import { cn } from "@/lib/utils"
import type { ComplaintStatus } from "@/lib/types"

const map: Record<ComplaintStatus, { label: string; className: string }> = {
  PENDING: {
    label: "Pending",
    className: "bg-turmeric/20 text-espresso border-turmeric/40",
  },
  IN_PROGRESS: {
    label: "In progress",
    className: "bg-forest/15 text-forest border-forest/30",
  },
  RESOLVED: {
    label: "Resolved",
    className: "bg-forest text-forest-foreground border-forest",
  },
  ESCALATED: {
    label: "Escalated",
    className: "bg-destructive/12 text-destructive border-destructive/30",
  },
}

export function StatusBadge({
  status,
  className,
}: {
  status: ComplaintStatus
  className?: string
}) {
  const s = map[status]
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide",
        s.className,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  )
}
