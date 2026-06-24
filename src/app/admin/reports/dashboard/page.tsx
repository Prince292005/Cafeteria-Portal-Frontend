"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  Calendar,
  RefreshCw,
  MessageSquareWarning,
  Star,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  getMonthlyReportRaw,
  MonthlyReportRaw,
  CanteenReportData,
} from "@/services/adminService";

// Fixed palette so colors stay stable across renders / canteen order changes
const PALETTE = [
  "#0d9488", // teal
  "#2563eb", // blue
  "#dc2626", // red
  "#ea580c", // orange
  "#7c3aed", // violet
  "#ca8a04", // amber
  "#16a34a", // green
  "#db2777", // pink
  "#0891b2", // cyan
  "#4338ca", // indigo
  "#65a30d", // lime
  "#9333ea", // purple
];

interface ScoreRow {
  canteenId: number;
  canteenName: string;
  complaintCount: number;
  avgRating: number; // 0 if no feedback this month
  feedbackCount: number;
  score: number; // 0-100 composite
}

export default function AdminAnalyticsDashboardPage() {
  const router = useRouter();
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [report, setReport] = useState<MonthlyReportRaw | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (month: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getMonthlyReportRaw(month);
      setReport(data);
    } catch (err) {
      console.error("Failed to load dashboard data", err);
      setError(
        "Couldn't load analytics for this month. The backend may be waking up — try again in a few seconds."
      );
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedMonth);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Derived analytics (all computed client-side from the same DTO the LLM report uses) ----

  const canteenReports: CanteenReportData[] = report?.canteenReports ?? [];

  const scoreRows: ScoreRow[] = useMemo(() => {
    return canteenReports.map((c) => {
      const complaintCount = c.complaints?.length ?? 0;
      const fb = c.feedbackSummary ?? [];
      const avgRating =
        fb.length > 0
          ? fb.reduce((sum, f) => sum + f.averageRating, 0) / fb.length
          : 0;
      const feedbackCount = fb.length;

      // Composite score: rating contributes positively (0-5 -> 0-70),
      // complaints pull it down (capped so a single canteen can't go far below 0).
      // This is intentionally simple and transparent — every input is visible in the table.
      const ratingComponent = (avgRating / 5) * 70;
      const complaintPenalty = Math.min(complaintCount * 8, 70);
      const score = Math.max(
        0,
        Math.round(ratingComponent + 30 - complaintPenalty)
      );

      return {
        canteenId: c.canteenId,
        canteenName: c.canteenName,
        complaintCount,
        avgRating: Math.round(avgRating * 10) / 10,
        feedbackCount,
        score,
      };
    });
  }, [canteenReports]);

  const totals = useMemo(() => {
    const totalComplaints = scoreRows.reduce(
      (s, r) => s + r.complaintCount,
      0
    );
    const totalFeedback = scoreRows.reduce((s, r) => s + r.feedbackCount, 0);
    const ratedRows = scoreRows.filter((r) => r.feedbackCount > 0);
    const avgRatingOverall =
      ratedRows.length > 0
        ? ratedRows.reduce((s, r) => s + r.avgRating, 0) / ratedRows.length
        : 0;

    const sortedByComplaints = [...scoreRows].sort(
      (a, b) => b.complaintCount - a.complaintCount
    );
    const sortedByScore = [...scoreRows].sort((a, b) => b.score - a.score);

    const worst = sortedByComplaints[0];
    const best = sortedByScore[0];
    const cleanCanteens = scoreRows.filter((r) => r.complaintCount === 0);

    return {
      totalComplaints,
      totalFeedback,
      avgRatingOverall: Math.round(avgRatingOverall * 10) / 10,
      worst,
      best,
      cleanCount: cleanCanteens.length,
      totalCanteens: scoreRows.length,
    };
  }, [scoreRows]);

  // Complaints per canteen (bar chart) — only show canteens that have complaints, sorted desc
  const barData = useMemo(
    () =>
      [...scoreRows]
        .filter((r) => r.complaintCount > 0)
        .sort((a, b) => b.complaintCount - a.complaintCount)
        .map((r) => ({ name: r.canteenName, complaints: r.complaintCount })),
    [scoreRows]
  );

  // Complaint title word-frequency -> rough category split for the donut.
  // The schema has no category column (titles/descriptions only), so this is
  // a best-effort keyword grouping, not a stored field — labelled "Other" where unclear.
  const categoryData = useMemo(() => {
    const buckets: Record<string, number> = {};
    const KEYWORDS: Record<string, string[]> = {
      Hygiene: ["hygiene", "dirty", "unhygien", "insect", "hair", "smell"],
      Cleanliness: ["clean", "trash", "garbage", "spill", "mess"],
      "Food Quality": ["taste", "quality", "stale", "cold", "raw", "undercooked", "overcooked"],
      "Staff Behaviour": ["staff", "rude", "behav", "attitude", "server"],
      "Service Delay": ["slow", "delay", "wait", "late", "queue"],
    };

    canteenReports.forEach((c) => {
      c.complaints?.forEach((comp) => {
        const text = `${comp.title} ${comp.description}`.toLowerCase();
        let matched = false;
        for (const [label, words] of Object.entries(KEYWORDS)) {
          if (words.some((w) => text.includes(w))) {
            buckets[label] = (buckets[label] ?? 0) + 1;
            matched = true;
            break;
          }
        }
        if (!matched) buckets["Other"] = (buckets["Other"] ?? 0) + 1;
      });
    });

    return Object.entries(buckets)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [canteenReports]);

  const insights = useMemo(() => {
    const lines: { icon: "warn" | "ok" | "tip"; text: string }[] = [];
    if (totals.totalComplaints === 0) {
      lines.push({
        icon: "ok",
        text: "No complaints were recorded across any canteen this month — operations look stable.",
      });
    } else {
      if (totals.worst && totals.worst.complaintCount > 0) {
        lines.push({
          icon: "warn",
          text: `${totals.worst.canteenName} had the highest complaint volume this month (${totals.worst.complaintCount}). Worth a closer look first.`,
        });
      }
      if (totals.cleanCount > 0) {
        lines.push({
          icon: "ok",
          text: `${totals.cleanCount} of ${totals.totalCanteens} canteens recorded zero complaints — attention can stay focused on the rest.`,
        });
      }
    }
    if (totals.totalFeedback === 0) {
      lines.push({
        icon: "tip",
        text: "No feedback responses came in this month. Low participation limits how much this dashboard can say about service quality — consider the micro-feedback / streak ideas to lift response rate.",
      });
    } else if (totals.best) {
      lines.push({
        icon: "ok",
        text: `${totals.best.canteenName} has the strongest combined score this month (${totals.best.score}/100), based on its rating and complaint volume.`,
      });
    }
    return lines;
  }, [totals]);

  const maxBar = Math.max(1, ...barData.map((b) => b.complaints));

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-base-200/30">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => router.push("/admin/reports")}
            className="btn btn-circle rounded-full btn-ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <LayoutDashboard className="w-8 h-8 text-teal-500" />
              Analytics Dashboard
            </h1>
            <p className="text-base-content/70">
              Live operational view across all canteens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto bg-base-100 p-2 rounded-xl shadow-sm border border-base-200">
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="month"
              className="input input-sm pl-10 bg-transparent border-none focus:outline-none"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div className="h-8 w-[1px] bg-base-300 mx-1" />
          <button
            onClick={() => fetchData(selectedMonth)}
            disabled={loading}
            className="btn btn-primary rounded-lg btn-sm gap-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-base-content/50">
          <span className="loading loading-bars loading-lg text-teal-500" />
          <p className="animate-pulse">Crunching this month&apos;s numbers...</p>
        </div>
      )}

      {!loading && error && (
        <div className="alert alert-error max-w-2xl mx-auto">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && report && (
        <div className="space-y-8 max-w-6xl mx-auto">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              label="Total Complaints"
              value={totals.totalComplaints}
              icon={<MessageSquareWarning className="w-5 h-5" />}
              tone="error"
            />
            <KpiCard
              label="Feedback Received"
              value={totals.totalFeedback}
              icon={<Star className="w-5 h-5" />}
              tone="primary"
            />
            <KpiCard
              label="Avg Rating (of rated)"
              value={totals.avgRatingOverall > 0 ? `${totals.avgRatingOverall} / 5` : "—"}
              icon={<TrendingUp className="w-5 h-5" />}
              tone="success"
            />
            <KpiCard
              label="Complaint-Free Canteens"
              value={`${totals.cleanCount} / ${totals.totalCanteens}`}
              icon={<CheckCircle2 className="w-5 h-5" />}
              tone="neutral"
            />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar chart: complaints per canteen */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-error" />
                  Complaints by Canteen
                </h2>
                {barData.length === 0 ? (
                  <EmptyMini text="No complaints recorded this month." />
                ) : (
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={barData} layout="vertical" margin={{ left: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                        <XAxis
                          type="number"
                          allowDecimals={false}
                          domain={[0, maxBar]}
                        />
                        <YAxis
                          type="category"
                          dataKey="name"
                          width={100}
                          tick={{ fontSize: 12 }}
                        />
                        <Tooltip />
                        <Bar dataKey="complaints" radius={[0, 6, 6, 0]}>
                          {barData.map((_, i) => (
                            <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>

            {/* Donut: complaint category split */}
            <div className="card bg-base-100 shadow-md border border-base-200">
              <div className="card-body">
                <h2 className="card-title text-lg flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Complaint Type Breakdown
                </h2>
                {categoryData.length === 0 ? (
                  <EmptyMini text="No complaints to categorize this month." />
                ) : (
                  <>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryData}
                            dataKey="value"
                            nameKey="name"
                            innerRadius={55}
                            outerRadius={85}
                            paddingAngle={2}
                          >
                            {categoryData.map((_, i) => (
                              <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend
                            verticalAlign="bottom"
                            height={36}
                            wrapperStyle={{ fontSize: 12 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-xs text-base-content/50 -mt-2">
                      Grouped from complaint titles/descriptions by keyword —
                      there&apos;s no dedicated category field in the database yet,
                      so treat this split as approximate.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Scorecard table */}
          <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg mb-2">Canteen Scorecard</h2>
              <div className="overflow-x-auto">
                <table className="table table-sm md:table-md">
                  <thead>
                    <tr>
                      <th>Canteen</th>
                      <th className="text-center">Complaints</th>
                      <th className="text-center">Feedback Qs</th>
                      <th className="text-center">Avg Rating</th>
                      <th className="text-center">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...scoreRows]
                      .sort((a, b) => b.score - a.score)
                      .map((row) => (
                        <tr key={row.canteenId}>
                          <td className="font-medium">{row.canteenName}</td>
                          <td className="text-center">
                            {row.complaintCount === 0 ? (
                              <span className="badge badge-success badge-sm">0</span>
                            ) : (
                              <span className="badge badge-error badge-sm">
                                {row.complaintCount}
                              </span>
                            )}
                          </td>
                          <td className="text-center">{row.feedbackCount}</td>
                          <td className="text-center">
                            {row.feedbackCount > 0 ? row.avgRating.toFixed(1) : "—"}
                          </td>
                          <td className="text-center">
                            <ScorePill score={row.score} />
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-base-content/50 mt-2">
                Score = weighted blend of average rating and complaint volume
                (0–100, higher is better). It&apos;s a simple, transparent
                composite — not an official CMC metric.
              </p>
            </div>
          </div>

          {/* Insight panel */}
          <div className="card bg-base-100 shadow-md border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-lg flex items-center gap-2 mb-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                What This Means
              </h2>
              <ul className="space-y-2">
                {insights.map((ins, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <InsightIcon type={ins.icon} />
                    <span>{ins.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  tone: "error" | "primary" | "success" | "neutral";
}) {
  const toneClasses: Record<string, string> = {
    error: "text-error bg-error/10",
    primary: "text-primary bg-primary/10",
    success: "text-success bg-success/10",
    neutral: "text-base-content bg-base-200",
  };
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      <div className="card-body p-4">
        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${toneClasses[tone]}`}>
          {icon}
        </div>
        <div className="mt-2">
          <p className="text-2xl font-bold leading-none">{value}</p>
          <p className="text-xs text-base-content/60 mt-1">{label}</p>
        </div>
      </div>
    </div>
  );
}

function ScorePill({ score }: { score: number }) {
  let cls = "badge-error";
  if (score >= 70) cls = "badge-success";
  else if (score >= 45) cls = "badge-warning";
  return <span className={`badge ${cls} font-semibold`}>{score}</span>;
}

function InsightIcon({ type }: { type: "warn" | "ok" | "tip" }) {
  if (type === "warn")
    return <AlertTriangle className="w-4 h-4 text-error mt-0.5 shrink-0" />;
  if (type === "tip")
    return <Lightbulb className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />;
  return <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />;
}

function EmptyMini({ text }: { text: string }) {
  return (
    <div className="h-40 flex items-center justify-center text-sm text-base-content/40 text-center px-6">
      {text}
    </div>
  );
}
