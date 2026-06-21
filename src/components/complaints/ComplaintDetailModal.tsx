"use client";

import React from "react";
import { Complaint, AdminReply, ComplaintStatus } from "./ComplaintTypes";
import { User, Shield, Calendar, Type } from "lucide-react";

interface ComplaintDetailModalProps {
  complaint: Complaint | null;
  onClose: () => void;
}

const ComplaintDetailModal: React.FC<ComplaintDetailModalProps> = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  // Helper to format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper to get status badge class (copied from ComplaintHistory)
  const getStatusBadgeClass = (status: ComplaintStatus) => {
    switch (status) {
      case "PENDING":
        return "badge-warning";
      case "IN_PROGRESS":
        return "badge-info";
      case "RESOLVED":
        return "badge-success";
      case "ESCALATED":
        return "badge-error";
      default:
        return "badge-ghost";
    }
  };

  // Helper to format status text (copied from ComplaintHistory)
  const formatStatusText = (status: ComplaintStatus) => {
    switch (status) {
      case "PENDING":
        return "Pending";
      case "IN_PROGRESS":
        return "In Progress";
      case "RESOLVED":
        return "Resolved";
      case "ESCALATED":
        return "Escalated";
      default:
        return status;
    }
  };

  return (
    // Modal backdrop
    <dialog id="complaint_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl bg-base-100">
        <form method="dialog">
          {/* Close button */}
          <button
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            onClick={onClose}
          >
            ✕
          </button>
        </form>

        {/* Modal Header */}
        <h3 className="font-bold text-2xl mb-2">{complaint.title}</h3>
        <div className="flex flex-wrap gap-2 items-center mb-6">
          <span className={`badge ${getStatusBadgeClass(complaint.status)}`}>
            {formatStatusText(complaint.status)}
          </span>
          <span className="text-sm text-base-content/70">
            Filed: {formatDate(complaint.createdAt)}
          </span>
        </div>

        {/* Original Complaint Description */}
        <div className="bg-base-200/60 p-4 rounded-lg">
          <h4 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <User size={18} /> Your Complaint
          </h4>
          <p className="text-base-content/90 whitespace-pre-wrap break-words">
            {complaint.description}
          </p>
        </div>

        {/* Admin Replies Section */}
        <div className="mt-6">
          <h4 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Shield size={18} /> Admin Replies
          </h4>
          {complaint.adminReplies.length === 0 ? (
            <p className="text-base-content/60 text-sm">
              An admin has not replied to this complaint yet.
            </p>
          ) : (
            <div className="space-y-4">
              {complaint.adminReplies.map((reply) => (
                <div
                  key={reply.id}
                  className="p-4 border border-base-300 rounded-lg"
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-base-content/80">
                      {reply.adminName}
                    </span>
                    <span className="text-xs text-base-content/60">
                      {formatDate(reply.repliedAt)}
                    </span>
                  </div>
                  <p className="text-base-content/90 whitespace-pre-wrap break-words">
                    {reply.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
};

export default ComplaintDetailModal;
