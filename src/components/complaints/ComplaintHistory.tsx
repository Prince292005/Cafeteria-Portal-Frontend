"use client";

// UPDATED: Import useState
import React, { useState } from "react";
import { AlertTriangle } from "lucide-react";
// UPDATED: Import new shared types
import { Complaint, ComplaintStatus } from "./ComplaintTypes";
// UPDATED: Import the new modal
import ComplaintDetailModal from "./ComplaintDetailModal";

// Interface now uses imported types
interface ComplaintHistoryProps {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
}

// --- Helper Components (No changes) ---
const HistorySkeleton = () => (
  <div className="space-y-8 animate-pulse">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex gap-4">
        <div className="skeleton w-12 h-12 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-4 w-full">
          <div className="skeleton h-4 w-2/3"></div>
          <div className="skeleton h-4 w-1/3"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="text-center py-10">
    <h3 className="text-xl font-semibold">No Complaints Yet!</h3>
    <p className="text-base-content/60 mt-2">
      When you file a complaint, it will appear here.
    </p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="text-center py-10 flex flex-col items-center gap-4">
    <AlertTriangle className="text-error" size={40} />
    <h3 className="text-xl font-semibold">Something went wrong</h3>
    <p className="text-base-content/60 mt-2">{message}</p>
  </div>
);

// --- Main Component (Updated) ---
const ComplaintHistory: React.FC<ComplaintHistoryProps> = ({
  complaints,
  loading,
  error,
}) => {
  // NEW: State to manage the selected complaint for the modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );

  // KEPT: Helper to get the correct DaisyUI badge class
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

  // KEPT: Helper to make status text look nice
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

  const renderContent = () => {
    if (loading) {
      return <HistorySkeleton />;
    }
    if (error) {
      return <ErrorState message={error} />;
    }
    if (complaints.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Date Filed</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              // UPDATED: Moved key prop to the same line as <tr>
              <tr
                key={complaint.id}
                className="cursor-pointer hover:bg-base-200"
                onClick={() => setSelectedComplaint(complaint)}
              >
                <td>
                  <div className="font-bold">{complaint.title}</div>
                </td>
                <td>
                  <span
                    className={`badge ${getStatusBadgeClass(complaint.status)}`}
                  >
                    {formatStatusText(complaint.status)}
                  </span>
                </td>
                <td>{new Date(complaint.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="card bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title text-2xl mb-6">Your Complaint History</h2>
        {renderContent()}
      </div>

      {/* NEW: Render the modal */}
      <ComplaintDetailModal
        complaint={selectedComplaint}
        onClose={() => setSelectedComplaint(null)}
      />
    </div>
  );
};

export default ComplaintHistory;
