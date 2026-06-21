"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Megaphone,
  Send,
  Bell,
  Calendar,
  Type,
  AlignLeft,
  Radio,
  Trash2,
  Loader2,
  CheckCircle,
  AlertCircle,
  X,
} from "lucide-react";
import {
  createAnnouncement,
  getActiveAnnouncements,
  deactivateAnnouncement,
  Announcement,
} from "@/services/adminService";
import toast from "react-hot-toast";

export default function AdminAnnouncementsPage() {
  const router = useRouter();

  // --- State ---
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [formStatus, setFormStatus] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    try {
      const data = await getActiveAnnouncements();
      if (Array.isArray(data)) {
        setAnnouncements(data.reverse());
      } else {
        setAnnouncements([]);
      }
    } catch (error) {
      toast.error("Failed to fetch announcements");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    setSubmitting(true);
    setFormStatus(null);

    try {
      await createAnnouncement(title, message);
      setFormStatus({
        type: "success",
        msg: "Announcement broadcasted successfully!",
      });
      setTitle("");
      setMessage("");
      fetchData(); // Refresh list

      // Clear success message after 3 seconds
      setTimeout(() => setFormStatus(null), 3000);
    } catch (error) {
      setFormStatus({ type: "error", msg: "Failed to post announcement." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to deactivate this? It will disappear from the student view."
      )
    )
      return;

    setDeactivatingId(id);
    try {
      await deactivateAnnouncement(id);
      // Optimistic UI Update: Remove it immediately
      setAnnouncements((prev) => prev.filter((ann) => ann.id !== id));
    } catch (error) {
      // console.error(error);
      toast.error("Failed to deactivate.");
    } finally {
      setDeactivatingId(null);
    }
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto p-4 md:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="btn btn-circle btn-ghost rounded-lg btn-sm hover:bg-base-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3 text-gray-800">
                <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
                  <Megaphone className="w-6 h-6" />
                </span>
                Announcements
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Manage broadcasts and updates for students.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- LEFT COL: COMPOSE FORM (4 cols) --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="card bg-white shadow-md border border-gray-100 sticky top-6">
              <div className="card-body p-0">
                {/* Form Header */}
                <div className="p-5 border-b border-gray-100 bg-gray-50/50 rounded-t-2xl">
                  <h2 className="font-bold text-lg flex items-center gap-2 text-gray-700">
                    <Radio className="w-4 h-4 text-primary" />
                    Compose New
                  </h2>
                </div>

                <div className="p-5">
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Title */}
                    <div className="form-control">
                      <label className="label pt-0">
                        <span className="label-text font-medium text-gray-600">
                          Headline
                        </span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Type size={18} />
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. Diwali Holiday"
                          className="input input-bordered w-full pl-10 focus:input-primary bg-white"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="form-control">
                      <label className="label pt-0">
                        <span className="label-text font-medium text-gray-600">
                          Message
                        </span>
                      </label>
                      <div className="relative">
                        <textarea
                          className="textarea textarea-bordered w-full h-32 pl-3 pt-3 focus:textarea-primary bg-white resize-none text-base"
                          placeholder="Type your announcement here..."
                          value={message}
                          onChange={(e) => setMessage(e.target.value)}
                          required
                        ></textarea>
                        <div className="absolute top-3 right-3 pointer-events-none text-gray-400">
                          <AlignLeft size={18} />
                        </div>
                      </div>
                    </div>

                    {/* Feedback Messages */}
                    {formStatus && (
                      <div
                        className={`alert ${
                          formStatus.type === "success"
                            ? "alert-success"
                            : "alert-error"
                        } py-2 text-sm rounded-lg`}
                      >
                        {formStatus.type === "success" ? (
                          <CheckCircle size={16} />
                        ) : (
                          <AlertCircle size={16} />
                        )}
                        <span>{formStatus.msg}</span>
                      </div>
                    )}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      className="btn btn-primary w-full rounded-lg shadow-lg shadow-primary/20 mt-2"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Broadcast Now
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT COL: FEED (8 cols) --- */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2 text-gray-700">
                <Bell className="w-5 h-5" />
                Live Feed
                <span className="badge badge-neutral badge-sm">
                  {announcements.length}
                </span>
              </h2>
              <button
                onClick={fetchData}
                className="btn btn-ghost btn-sm rounded-lg text-gray-500 hover:text-primary"
                disabled={loading}
              >
                <Loader2
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>

            {/* List */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm">Syncing feed...</p>
              </div>
            ) : announcements.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-dashed border-gray-300 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                  <Megaphone className="w-6 h-6 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900">Quiet for now</h3>
                <p className="text-gray-500 text-sm max-w-xs mt-1">
                  No active announcements. Use the form on the left to create
                  one.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="card bg-white shadow-sm border border-gray-100 group transition-all hover:shadow-md"
                  >
                    <div className="card-body p-5">
                      <div className="flex items-start justify-between gap-4">
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-800 truncate">
                              {ann.title}
                            </h3>
                            {ann.createdAt && (
                              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                <Calendar size={12} />
                                {new Date(ann.createdAt).toLocaleDateString(
                                  undefined,
                                  { month: "short", day: "numeric" }
                                )}
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">
                            {ann.message}
                          </p>
                        </div>

                        {/* Actions (Deactivate) */}
                        <div className="flex-none pt-1">
                          <div
                            className="tooltip tooltip-left"
                            data-tip="Deactivate Announcement"
                          >
                            <button
                              onClick={() => ann.id && handleDeactivate(ann.id)}
                              disabled={deactivatingId === ann.id}
                              className="btn btn-square btn-ghost rounded-full btn-sm text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              {deactivatingId === ann.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
