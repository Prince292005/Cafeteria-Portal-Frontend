"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import { useUser } from "@/contexts/authContext"; // Import Auth Context
import toast from "react-hot-toast";

export default function ComplaintHistoryPage() {
  const params = useParams();
  const router = useRouter();
  // const canteenId = params.id as string; // Optional filtering if needed later

  const { user, loading: authLoading } = useUser(); // Get User State
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Helper: Status Badge ---
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <div className="badge badge-success gap-1.5 text-white py-3 px-4 font-medium shadow-sm border-none">
            <CheckCircle className="w-3.5 h-3.5" /> Resolved
          </div>
        );
      case "IN_PROGRESS":
        return (
          <div className="badge badge-info gap-1.5 text-white py-3 px-4 font-medium shadow-sm border-none">
            <Activity className="w-3.5 h-3.5" /> In Progress
          </div>
        );
      case "ESCALATED":
        return (
          <div className="badge badge-error gap-1.5 text-white py-3 px-4 font-medium shadow-sm border-none">
            <AlertTriangle className="w-3.5 h-3.5" /> Escalated
          </div>
        );
      default: // PENDING
        return (
          <div className="badge badge-warning gap-1.5 text-white py-3 px-4 font-medium shadow-sm border-none">
            <Clock className="w-3.5 h-3.5" /> Pending
          </div>
        );
    }
  };

  useEffect(() => {
    // Don't fetch if auth is still loading or user is not logged in
    if (authLoading || !user) return;

    const fetchHistory = async () => {
      try {
        const data = await getMyComplaints();
        // Sort Newest First
        const sorted = data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setComplaints(sorted);
      } catch (error) {
        console.error("Failed to fetch history", error);
        toast.error("Failed to load complaints history");
        setComplaints([]); // Ensure empty state on error
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user, authLoading]);

  // --- 1. Auth Loading State ---
  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // --- 2. Not Logged In State ---
  if (!user) {
    return (
      <div className="min-h-screen bg-base-200/30 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-white shadow-xl border border-base-200 text-center">
          <div className="card-body items-center p-10">
            <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-base-content/40" />
            </div>
            <h2 className="text-2xl font-bold text-base-content">
              Login Required
            </h2>
            <p className="text-base-content/60 mt-2 mb-6">
              You must be logged in to view your complaint history.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => router.back()}
                className="btn btn-ghost rounded-lg"
              >
                Go Back
              </button>
              <Link
                href="/login"
                className="btn btn-primary rounded-lg gap-2 px-6"
              >
                <LogIn className="w-4 h-4" /> Login Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- 3. Logged In State ---
  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost bg-white shadow-sm hover:bg-gray-100 border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3 text-gray-900">
              <History className="w-8 h-8 text-blue-600" />
              My Complaints
            </h1>
            <p className="text-gray-500 mt-1">
              Track the status of your reported issues.
            </p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="text-gray-400 text-sm animate-pulse">
              Fetching records...
            </p>
          </div>
        ) : complaints.length === 0 ? (
          // Empty Data State
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <History className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No history found
            </h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">
              You haven't reported any issues yet.
            </p>
          </div>
        ) : (
          // Complaints List
          <div className="grid grid-cols-1 gap-4">
            {complaints.map((complaint) => (
              <div
                key={complaint.complainId}
                className="card bg-white shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 group"
              >
                <div className="card-body p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    {/* Left: Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="badge badge-ghost font-mono text-xs font-bold text-gray-500 bg-gray-100 border-none px-2">
                          #{complaint.complainId}
                        </span>
                        {/* Canteen Tag */}
                        <div className="flex items-center text-xs font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                          <Store className="w-3 h-3 mr-1.5" />
                          {complaint.canteenName ||
                            `Canteen ${complaint.canteenId}`}
                        </div>
                        {/* Date */}
                        <span className="text-xs text-gray-400">
                          {new Date(complaint.createdAt).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric", year: "numeric" }
                          )}
                        </span>
                      </div>

                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {complaint.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {complaint.description}
                      </p>
                    </div>

                    {/* Right: Status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      {getStatusBadge(complaint.complaintStatus)}
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-300">
                        Current Status
                      </span>
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
