"use client";

import React, { useEffect, useState } from "react";
import {
  getAllComplaints,
  updateComplaintStatus,
  getComplaintImageUrl,
  escalateComplaint,
  Complaint,
} from "@/services/adminService";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  MessageSquareWarning,
  Activity,
  MoreVertical,
  Paperclip,
  X,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED" | "ESCALATED";

export default function AdminComplaintsPage() {
  const router = useRouter();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Image Modal State ---
  const [viewingImage, setViewingImage] = useState<string | null>(null);
  const [imageLoadingId, setImageLoadingId] = useState<number | null>(null);

  const fetchComplaints = async () => {
    try {
      const data = await getAllComplaints();
      setComplaints(data.sort((a, b) => b.complainId - a.complainId));
    } catch (error) {
      toast.error("Failed to load complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // --- Handlers ---

  const handleViewImage = async (id: number) => {
    setImageLoadingId(id);
    const toastId = toast.loading("Fetching proof...");
    try {
      const url = await getComplaintImageUrl(id);
      if (url && url.startsWith("http")) {
        setViewingImage(url);
        toast.dismiss(toastId);
      } else {
        toast.error("No attachment found or link expired.", { id: toastId });
      }
    } catch (error) {
      toast.error("Failed to load image.", { id: toastId });
    } finally {
      setImageLoadingId(null);
    }
  };

  const onActionClick = async (id: number, status: ComplaintStatus) => {
    if (document.activeElement instanceof HTMLElement)
      document.activeElement.blur();

    setTimeout(async () => {
      try {
        if (status === "ESCALATED") {
          await escalateComplaint(id);
        } else {
          await updateComplaintStatus(id, status);
        }

        setComplaints((prev) =>
          prev.map((c) =>
            c.complainId === id ? { ...c, complaintStatus: status } : c
          )
        );
        toast.success(`Marked as ${status}`);
      } catch (e) {
        console.error(e);
        toast.error("Action failed");
      }
    }, 200);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return (
          <div className="badge badge-success gap-1 text-white pl-1.5 pr-3">
            <CheckCircle className="w-3 h-3" /> Resolved
          </div>
        );
      case "IN_PROGRESS":
        return (
          <div className="badge badge-info gap-1 text-white pl-1.5 pr-3">
            <Activity className="w-3 h-3" /> In Progress
          </div>
        );
      case "ESCALATED":
        return (
          <div className="badge badge-error gap-1 text-white pl-1.5 pr-3">
            <AlertTriangle className="w-3 h-3" /> Escalated
          </div>
        );
      default:
        return (
          <div className="badge badge-warning gap-1 pl-1.5 pr-3">
            <Clock className="w-3 h-3" /> Pending
          </div>
        );
    }
  };

  if (loading)
    return (
      <div className="flex justify-center h-screen items-center">
        <span className="loading loading-spinner loading-lg text-red-500"></span>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <MessageSquareWarning className="w-6 h-6 md:w-8 md:h-8 text-red-500" />
              Manage Complaints
            </h1>
            <p className="text-sm md:text-base text-base-content/70">
              Overview of student grievances
            </p>
          </div>
        </div>
      </div>

      {/* --- Desktop Table View (Hidden on Mobile) --- */}
      <div className="hidden md:block overflow-visible card bg-base-100 shadow-xl border border-base-200">
        <table className="table table-zebra w-full">
          <thead className="bg-base-200/50">
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Student ID</th>
              <th>Issue</th>
              <th>Status</th>
              <th className="text-end pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {complaints.map((complaint) => (
              <tr key={complaint.complainId} className="hover">
                <td className="font-mono text-xs opacity-50">
                  #{complaint.complainId}
                </td>
                <td>
                  <div className="text-sm font-medium">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </div>
                  <div className="text-xs opacity-50">
                    {new Date(complaint.createdAt).toLocaleTimeString()}
                  </div>
                </td>
                <td className="font-mono text-sm">{complaint.emailId}</td>
                <td className="max-w-xs">
                  <div className="font-bold truncate">{complaint.title}</div>
                  <div
                    className="text-sm opacity-70 truncate"
                    title={complaint.description}
                  >
                    {complaint.description}
                  </div>
                </td>
                <td>{getStatusBadge(complaint.complaintStatus)}</td>

                <td className="text-end pr-4">
                  <div className="flex items-center justify-end gap-2">
                    {/* Attachment Icon */}
                    <div className="tooltip" data-tip="View Attachment">
                      <button
                        onClick={() => handleViewImage(complaint.complainId)}
                        className={`btn btn-sm btn-square btn-ghost ${
                          !complaint.imageKey
                            ? "opacity-20 pointer-events-none"
                            : "hover:text-blue-600 hover:bg-blue-50"
                        }`}
                        disabled={
                          imageLoadingId === complaint.complainId ||
                          !complaint.imageKey
                        }
                      >
                        {imageLoadingId === complaint.complainId ? (
                          <span className="loading loading-spinner loading-xs"></span>
                        ) : (
                          <Paperclip className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Actions Dropdown */}
                    <div className="dropdown dropdown-end">
                      <div
                        tabIndex={0}
                        role="button"
                        className="btn btn-sm btn-ghost btn-square"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200"
                      >
                        <li className="menu-title px-2 py-1 text-xs opacity-50 uppercase font-bold">
                          Change Status
                        </li>
                        {/* Menu Items Logic (Same as before) */}
                        {complaint.complaintStatus !== "IN_PROGRESS" &&
                          complaint.complaintStatus !== "RESOLVED" && (
                            <li>
                              <a
                                onClick={() =>
                                  onActionClick(
                                    complaint.complainId,
                                    "IN_PROGRESS"
                                  )
                                }
                                className="text-info"
                              >
                                <Activity className="w-4 h-4" /> Mark In
                                Progress
                              </a>
                            </li>
                          )}
                        {complaint.complaintStatus !== "RESOLVED" && (
                          <li>
                            <a
                              onClick={() =>
                                onActionClick(complaint.complainId, "RESOLVED")
                              }
                              className="text-success"
                            >
                              <CheckCircle className="w-4 h-4" /> Mark Resolved
                            </a>
                          </li>
                        )}
                        {complaint.complaintStatus !== "ESCALATED" &&
                          complaint.complaintStatus !== "RESOLVED" && (
                            <li>
                              <a
                                onClick={() =>
                                  onActionClick(
                                    complaint.complainId,
                                    "ESCALATED"
                                  )
                                }
                                className="text-error"
                              >
                                <AlertTriangle className="w-4 h-4" /> Escalate
                              </a>
                            </li>
                          )}
                        {(complaint.complaintStatus === "RESOLVED" ||
                          complaint.complaintStatus === "ESCALATED") && (
                          <li>
                            <a
                              onClick={() =>
                                onActionClick(
                                  complaint.complainId,
                                  "IN_PROGRESS"
                                )
                              }
                              className="text-warning"
                            >
                              <Clock className="w-4 h-4" /> Re-open Case
                            </a>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- Mobile Card View (Visible on Mobile) --- */}
      <div className="md:hidden space-y-4">
        {complaints.map((complaint) => (
          <div
            key={complaint.complainId}
            className="card bg-base-100 shadow-sm border border-base-200"
          >
            <div className="card-body p-5">
              <div className="flex justify-between items-start mb-2">
                <span className="badge badge-ghost font-mono text-xs">
                  #{complaint.complainId}
                </span>
                {getStatusBadge(complaint.complaintStatus)}
              </div>

              <h3 className="font-bold text-lg">{complaint.title}</h3>
              <p className="text-sm text-base-content/70 line-clamp-2 mb-3">
                {complaint.description}
              </p>

              <div className="flex flex-col gap-1 text-xs text-base-content/50 mb-4">
                <div className="flex justify-between">
                  <span>Student ID:</span>
                  <span className="font-mono text-base-content/80">
                    {complaint.emailId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="card-actions justify-between items-center border-t pt-4 border-base-100">
                {/* View Proof Button */}
                <button
                  onClick={() => handleViewImage(complaint.complainId)}
                  className={`btn btn-sm btn-ghost gap-2 ${
                    !complaint.imageKey
                      ? "btn-disabled opacity-50"
                      : "text-blue-600"
                  }`}
                  disabled={
                    !complaint.imageKey ||
                    imageLoadingId === complaint.complainId
                  }
                >
                  {imageLoadingId === complaint.complainId ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    <Paperclip className="w-4 h-4" />
                  )}
                  {complaint.imageKey ? "View Proof" : "No Proof"}
                </button>

                {/* Mobile Dropdown */}
                <div className="dropdown dropdown-top dropdown-end">
                  <div
                    tabIndex={0}
                    role="button"
                    className="btn btn-sm btn-outline btn-neutral"
                  >
                    Actions <MoreVertical className="w-4 h-4" />
                  </div>
                  <ul
                    tabIndex={0}
                    className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-52 border border-base-200 mb-2"
                  >
                    {/* Reused Menu Logic */}
                    {complaint.complaintStatus !== "IN_PROGRESS" &&
                      complaint.complaintStatus !== "RESOLVED" && (
                        <li>
                          <a
                            onClick={() =>
                              onActionClick(complaint.complainId, "IN_PROGRESS")
                            }
                          >
                            In Progress
                          </a>
                        </li>
                      )}
                    {complaint.complaintStatus !== "RESOLVED" && (
                      <li>
                        <a
                          onClick={() =>
                            onActionClick(complaint.complainId, "RESOLVED")
                          }
                        >
                          Resolve
                        </a>
                      </li>
                    )}
                    {complaint.complaintStatus !== "ESCALATED" &&
                      complaint.complaintStatus !== "RESOLVED" && (
                        <li>
                          <a
                            onClick={() =>
                              onActionClick(complaint.complainId, "ESCALATED")
                            }
                            className="text-error"
                          >
                            Escalate
                          </a>
                        </li>
                      )}
                    {(complaint.complaintStatus === "RESOLVED" ||
                      complaint.complaintStatus === "ESCALATED") && (
                      <li>
                        <a
                          onClick={() =>
                            onActionClick(complaint.complainId, "IN_PROGRESS")
                          }
                        >
                          Re-open
                        </a>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- IMAGE MODAL --- */}
      {viewingImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setViewingImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full bg-transparent flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setViewingImage(null)}
              className="absolute -top-12 right-0 btn btn-circle btn-ghost text-white hover:bg-white/20"
            >
              <X className="w-6 h-6" />
            </button>

            <img
              src={viewingImage}
              alt="Complaint Proof"
              className="rounded-lg shadow-2xl object-contain max-h-[75vh] w-auto border border-white/10"
            />

            <div className="flex gap-3">
              <a
                href={viewingImage}
                target="_blank"
                rel="noreferrer"
                className="btn btn-sm btn-ghost text-white hover:bg-white/20 gap-2"
              >
                <ExternalLink className="w-4 h-4" /> Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
