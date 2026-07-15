"use client"

import Link from "next/link"
import { format } from "date-fns"
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowUpRight,
  MessageSquareWarning,
  Star,
  Store,
  TriangleAlert,
} from "lucide-react"
import {
  optionToScore,
  useAllComplaints,
  useCanteens,
  useStats,
} from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { StatusBadge } from "@/components/kit/status-badge"

const STATUS_COLORS: Record<string, string> = {
  Pending: "#d99a2b",
  "In progress": "#3f6f52",
  Resolved: "#2f5a41",
  Escalated: "#b8492f",
}

export function AdminOverview() {
  const stats = useStats()
  const canteens = useCanteens()
  const complaints = useAllComplaints()

  const statusData = [
    { name: "Pending", value: complaints.filter((c) => c.complaintStatus === "PENDING").length },
    { name: "In progress", value: complaints.filter((c) => c.complaintStatus === "IN_PROGRESS").length },
    { name: "Resolved", value: complaints.filter((c) => c.complaintStatus === "RESOLVED").length },
    { name: "Escalated", value: complaints.filter((c) => c.complaintStatus === "ESCALATED").length },
  ].filter((d) => d.value > 0)

  const ratingData = [...canteens]
    .sort((a, b) => a.rating - b.rating)
    .map((c) => ({ name: c.canteenName, rating: Number(c.rating.toFixed(2)) }))

  const cards = [
    { label: "Canteens", value: stats.canteens, icon: <Store className="h-5 w-5" />, href: "/admin/canteens", accent: "text-terracotta" },
    { label: "Open complaints", value: stats.pending, icon: <MessageSquareWarning className="h-5 w-5" />, href: "/admin/complaints", accent: "text-turmeric" },
    { label: "Escalated", value: stats.escalated, icon: <TriangleAlert className="h-5 w-5" />, href: "/admin/complaints", accent: "text-destructive" },
    { label: "Avg rating", value: stats.avgRating.toFixed(1), icon: <Star className="h-5 w-5" />, href: "/admin/feedback", accent: "text-forest" },
  ]

  return (
    <div>
      <AdminHeader title="Overview" description="Everything happening across campus dining, at a glance." />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group rounded-3xl border border-espresso/10 bg-card p-6 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-espresso/5"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-cream ${c.accent}`}>
                {c.icon}
              </span>
              <ArrowUpRight className="h-4 w-4 text-espresso/30 transition-colors group-hover:text-terracotta" />
            </div>
            <p className="mt-4 font-serif text-4xl font-semibold">{c.value}</p>
            <p className="text-sm text-espresso/55">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-espresso/10 bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Complaints by status</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {statusData.map((d) => (
                    <Cell key={d.name} fill={STATUS_COLORS[d.name]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(60,40,30,0.1)", fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap justify-center gap-4">
            {statusData.map((d) => (
              <span key={d.name} className="flex items-center gap-1.5 text-xs text-espresso/60">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: STATUS_COLORS[d.name] }} />
                {d.name} ({d.value})
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-espresso/10 bg-card p-6">
          <h2 className="font-serif text-xl font-semibold">Average rating by canteen</h2>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={ratingData}
                margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
                barCategoryGap={10}
              >
                <XAxis
                  type="number"
                  domain={[0, 5]}
                  tick={{ fontSize: 12, fill: "#6b5544" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={110}
                  tick={{ fontSize: 12, fill: "#6b5544" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "rgba(184,73,47,0.06)" }}
                  contentStyle={{ borderRadius: 12, border: "1px solid rgba(60,40,30,0.1)", fontSize: 13 }}
                />
                <Bar dataKey="rating" fill="#b8492f" radius={[0, 6, 6, 0]} maxBarSize={26}>
                  {ratingData.map((_, i) => (
                    <Cell key={i} fill="#b8492f" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-espresso/10 bg-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-semibold">Recent complaints</h2>
          <Link href="/admin/complaints" className="text-sm font-semibold text-terracotta hover:underline">
            View all
          </Link>
        </div>
        <div className="mt-4 space-y-2">
          {complaints.slice(0, 5).map((c) => (
            <div key={c.complainId} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-espresso/8 bg-background p-4">
              <div>
                <p className="font-medium">{c.title}</p>
                <p className="text-xs text-espresso/50">
                  {c.canteenName} · {format(new Date(c.createdAt), "d MMM")}
                </p>
              </div>
              <StatusBadge status={c.complaintStatus} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
