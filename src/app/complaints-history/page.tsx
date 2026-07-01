"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  History,
  Clock,
  CheckCircle,
  Store,
  Activity,
  AlertTriangle,
  LogIn,
  Lock,
} from "lucide-react";
import { getMyComplaints, Complaint } from "@/services/complaintService";
import { useUser } from "@/contexts/authContext";
import toast from "react-hot-toast";

export default function ComplaintHistoryPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useUser();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--chalk-green)] text-white py-2 px-3.5 rounded-full">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved
          </div>
        );
      case "IN_PROGRESS":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-sky-700 text-white py-2 px-3.5 rounded-full">
            <Activity className="w-3.5 h-3.5" /> In Progress
          </div>
        );
      case "ESCALATED":
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--turmeric-deep)] text-white py-2 px-3.5 rounded-full">
            <AlertTriangle className="w-3.5 h-3.5" /> Escalated
          </div>
        );
      default: // PENDING
        return (
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-amber-700 text-white py-2 px-3.5 rounded-full">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
        );
    }
  };

  useEffect(() => {
    if (authLoading || !user) return;

    const fetchHistory = async () => {
      try {
        const data = await getMyComplaints();
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComplaints(sorted);
      } catch (error) {
        console.error("Failed to fetch history", error);
        toast.error("Failed to load complaints history");
        setComplaints([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--paper)]">
        <span className="loading loading-spinner loading-lg text-[var(--turmeric)]"></span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--paper-dim)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--kraft-border)] shadow-sm text-center">
          <div className="p-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-[var(--paper-dim)] rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-[var(--ink-soft)]/50" />
            </div>
            <h2 className="font-display text-2xl text-[var(--ink)]">
              Login required
            </h2>
            <p className="text-[var(--ink-soft)] mt-2 mb-6">
              You must be logged in to view your complaint history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="px-5 py-2.5 rounded-lg font-medium text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] transition-colors"
              >
                Go back
              </button>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-[var(--turmeric)] text-white hover:bg-[var(--turmeric-deep)] transition-colors"
              >
                <LogIn className="w-4 h-4" /> Login now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper-dim)] p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full flex items-center justify-center bg-white border border-[var(--kraft-border)] text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-display text-3xl text-[var(--ink)] flex items-center gap-3">
              <History className="w-7 h-7 text-[var(--turmeric)]" />
              My complaints
            </h1>
            <p className="text-[var(--ink-soft)] mt-1 text-sm">
              Track the status of your reported issues.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="loading loading-spinner loading-lg text-[var(--turmeric)]"></span>
            <p className="text-[var(--ink-soft)]/60 text-sm animate-pulse">
              Fetching records...
            </p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-[var(--kraft-border)]">
            <div className="w-16 h-16 bg-[var(--paper-dim)] rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-[var(--ink-soft)]/30" />
            </div>
            <h3 className="font-display text-lg text-[var(--ink)]">
              No history found
            </h3>
            <p className="text-[var(--ink-soft)]/70 max-w-xs mx-auto mt-2">
              You haven&apos;t reported any issues yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.complainId}
                className="bg-white rounded-2xl border border-[var(--kraft-border)] hover:shadow-md transition-shadow duration-200 group"
              >
                <div className="p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        <span className="text-xs font-semibold text-[var(--ink-soft)]/60 bg-[var(--paper-dim)] px-2.5 py-1 rounded-lg">
                          #{complaint.complainId}
                        </span>
                        <div className="flex items-center text-xs font-bold text-[var(--ink-soft)] bg-white border border-[var(--kraft-border)] px-2.5 py-1 rounded-md">
                          <Store className="w-3 h-3 mr-1.5" />
                          {complaint.canteenName ||
                            `Canteen ${complaint.canteenId}`}
                        </div>
                        <span className="text-xs text-[var(--ink-soft)]/50">
                          {new Date(complaint.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>

                      <h3 className="font-display text-lg text-[var(--ink)] mb-2 group-hover:text-[var(--turmeric)] transition-colors">
                        {complaint.title}
                      </h3>
                      <p className="text-[var(--ink-soft)] text-sm leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>

                    {/* Right: Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {getStatusBadge(complaint.complaintStatus)}
                      
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
