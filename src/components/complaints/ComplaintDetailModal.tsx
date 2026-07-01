"use client";

import React from "react";
import { Complaint, AdminReply, ComplaintStatus } from "./ComplaintTypes";
import { X, User, Shield, Clock, CheckCircle, Activity, AlertTriangle } from "lucide-react";

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", bg: "bg-amber-700/10", text: "text-amber-800", icon: <Clock className="w-3.5 h-3.5" /> },
  IN_PROGRESS: { label: "In progress", bg: "bg-sky-700/10", text: "text-sky-800", icon: <Activity className="w-3.5 h-3.5" /> },
  RESOLVED: { label: "Resolved", bg: "bg-[var(--chalk-green)]/10", text: "text-[var(--chalk-green)]", icon: <CheckCircle className="w-3.5 h-3.5" /> },
  ESCALATED: { label: "Escalated", bg: "bg-[var(--turmeric)]/10", text: "text-[var(--turmeric-deep)]", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
};

const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({ complaint, onClose }) => {
  if (!complaint) return null;

  const status = STATUS_CONFIG[complaint.status] ?? STATUS_CONFIG.PENDING;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[var(--espresso)]/50 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-xl bg-[var(--paper)] rounded-2xl border border-[var(--kraft-border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-[var(--kraft-border)]">
          <div className="flex-1 min-w-0">
            <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-2.5 ${status.bg} ${status.text}`}>
              {status.icon}
              {status.label}
            </div>
            <h3 className="font-display text-xl text-[var(--ink)] leading-snug">
              {complaint.title}
            </h3>
            <p className="text-xs text-[var(--ink-soft)]/55 mt-1">
              Filed {new Date(complaint.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--ink-soft)]/50 hover:bg-[var(--paper-dim)] hover:text-[var(--ink)] transition-colors shrink-0 mt-0.5"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Your complaint */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-2.5">
              <User className="w-4 h-4 text-[var(--turmeric)]" /> Your report
            </h4>
            <div className="bg-[var(--paper-dim)] border border-[var(--kraft-border)] rounded-xl p-4">
              <p className="text-[var(--ink-soft)] leading-relaxed whitespace-pre-wrap break-words text-sm">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Admin replies */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--ink)] flex items-center gap-2 mb-2.5">
              <Shield className="w-4 h-4 text-[var(--chalk-green)]" /> CMC response
            </h4>
            {complaint.adminReplies.length === 0 ? (
              <div className="bg-[var(--paper-dim)] border border-[var(--kraft-border)] rounded-xl p-4 text-sm text-[var(--ink-soft)]/60">
                The CMC has not responded to this complaint yet. You&apos;ll be
                notified once the status changes.
              </div>
            ) : (
              <div className="space-y-3">
                {complaint.adminReplies.map((reply: AdminReply) => (
                  <div key={reply.id} className="bg-[var(--chalk-green)]/5 border border-[var(--chalk-green)]/15 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[var(--chalk-green)]">{reply.adminName}</span>
                      <span className="text-xs text-[var(--ink-soft)]/50">
                        {new Date(reply.repliedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--ink)] whitespace-pre-wrap break-words">{reply.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintDetailModal;
