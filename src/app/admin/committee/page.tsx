"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Plus,
  Edit2,
  Trash2,
  GraduationCap,
  User,
  Mail,
  Award,
  Loader2,
  Camera,
  X,
  AlertTriangle,
} from "lucide-react";
import {
  getCommitteeMembers,
  addCommitteeMember,
  updateCommitteeMember,
  deleteCommitteeMember,
  uploadMemberPhoto,
  CommitteeMember,
  CommitteeResponse,
} from "@/services/adminService";
import toast from "react-hot-toast";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function AdminCommitteePage() {
  const router = useRouter();

  const [committee, setCommittee] = useState<CommitteeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(
    null
  );

  // Delete State
  const [memberToDelete, setMemberToDelete] = useState<CommitteeMember | null>(
    null
  );

  const [formData, setFormData] = useState<CommitteeMember>({
    name: "",
    email: "",
    designation: "",
    role: "CORE_MEMBER",
    studentId: "",
    photoUrl: "",
  });

  // ✅ NEW: Separate state for the file to upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // --- Fetch Data ---
  const fetchMembers = async () => {
    try {
      const data = await getCommitteeMembers();
      setCommittee(data);
    } catch (error) {
      toast.error("Failed to load committee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // --- Handlers ---

  const handleOpenModal = (member?: CommitteeMember) => {
    // Reset File State
    setSelectedFile(null);
    setPreviewUrl(null);

    if (member) {
      setEditingMember(member);
      setFormData({ ...member });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        email: "",
        designation: "",
        role: "CORE_MEMBER",
        studentId: "",
        photoUrl: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleDeleteClick = (member: CommitteeMember) => {
    setMemberToDelete(member);
  };

  const confirmDelete = async () => {
    if (!memberToDelete?.id) return;
    try {
      await deleteCommitteeMember(memberToDelete.id);
      toast.success("Member removed successfully");
      fetchMembers();
    } catch (error) {
      toast.error("Failed to delete member");
    } finally {
      setMemberToDelete(null);
    }
  };

  // ✅ FIXED: Handle File Selection Locally (Preview Only)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Validation
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File is too large (Max 5MB)");
      return;
    }

    // 2. Set State (Do not upload yet)
    setSelectedFile(file);

    // 3. Create Local Preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  // ✅ FIXED: Upload Logic moved to Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    // Loading toast
    const toastId = toast.loading(
      editingMember ? "Updating member..." : "Adding member..."
    );

    try {
      let memberId = editingMember?.id;

      // 1. Save/Update Member Data first to ensure we have an ID
      if (memberId) {
        await updateCommitteeMember(memberId, formData);
      } else {
        const newMember = await addCommitteeMember(formData);
        // Assuming backend returns the created object with an ID
        memberId = newMember.id || newMember.committeeId;
      }

      // 2. If we have a new file AND a valid ID, upload the photo
      if (selectedFile && memberId) {
        toast.loading("Uploading photo...", { id: toastId });
        await uploadMemberPhoto(memberId, selectedFile);
      }

      toast.success("Member saved successfully!", { id: toastId });
      setIsModalOpen(false);
      fetchMembers(); // Refresh list to get real URLs from server
    } catch (error) {
      console.error(error);
      toast.error("Operation failed", { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const getImgUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("blob:")) return path; // Allow local preview blobs
    return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  };

  // Logic to decide which image to show in the modal
  // Priority: 1. Local Preview (New Upload) -> 2. Existing Photo URL -> 3. Default Icon
  const displayImage =
    previewUrl || (formData.photoUrl ? getImgUrl(formData.photoUrl) : null);

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-lg text-primary"></span>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-10">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost rounded-full"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" /> Committee Management
            </h1>
            <p className="text-base-content/70">
              Manage faculty mentors and student representatives.
            </p>
          </div>
        </div>

        <button
          className="btn btn-primary gap-2 shadow-md rounded-lg"
          onClick={() => handleOpenModal()}
        >
          <Plus className="w-5 h-5" /> Add Member
        </button>
      </div>

      {/* Faculty */}
      <div className="mb-12">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-base-content/50 uppercase tracking-widest border-b pb-2">
          <GraduationCap className="w-5 h-5" /> Faculty Mentor
        </h2>

        {committee?.facultyMentor ? (
          <div className="w-full md:w-1/2 xl:w-1/3">
            <MemberCard
              member={committee.facultyMentor}
              onEdit={() => handleOpenModal(committee.facultyMentor!)}
              onDelete={() => handleDeleteClick(committee.facultyMentor!)}
              bgClass="bg-purple-50 border-purple-100"
            />
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-base-300 rounded-xl text-center text-base-content/40">
            No Faculty Mentor Assigned
          </div>
        )}
      </div>

      {/* Leadership */}
      <div className="mb-12">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-base-content/50 uppercase tracking-widest border-b pb-2">
          <Award className="w-5 h-5" /> Committee Leads
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {committee?.convener ? (
            <MemberCard
              member={committee.convener}
              onEdit={() => handleOpenModal(committee.convener!)}
              onDelete={() => handleDeleteClick(committee.convener!)}
              bgClass="bg-blue-50 border-blue-100"
              badgeColor="badge-primary"
            />
          ) : (
            <EmptySlot title="Convener" />
          )}

          {committee?.deputyConvener ? (
            <MemberCard
              member={committee.deputyConvener}
              onEdit={() => handleOpenModal(committee.deputyConvener!)}
              onDelete={() => handleDeleteClick(committee.deputyConvener!)}
              bgClass="bg-blue-50 border-blue-100"
              badgeColor="badge-secondary"
            />
          ) : (
            <EmptySlot title="Deputy Convener" />
          )}
        </div>
      </div>

      {/* Core Members */}
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2 mb-4 text-base-content/50 uppercase tracking-widest border-b pb-2">
          <User className="w-5 h-5" /> Core Committee
        </h2>

        {committee?.coreMembers && committee.coreMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {committee.coreMembers.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onEdit={() => handleOpenModal(member)}
                onDelete={() => handleDeleteClick(member)}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 border-2 border-dashed border-base-300 rounded-xl text-center text-base-content/40">
            No Core Members Added
          </div>
        )}
      </div>

      {/* --- EDIT MODAL --- */}
      {isModalOpen && (
        <div className="modal modal-open backdrop-blur-sm">
          <div className="modal-box max-w-2xl p-0 overflow-hidden bg-white rounded-2xl shadow-2xl">
            <div className="bg-base-200/50 px-6 py-4 border-b border-base-200 flex justify-between items-center">
              <h3 className="font-bold text-lg">
                {editingMember ? "Edit Member" : "Add New Member"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  {/* Photo Upload Section */}
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-24 h-24 rounded-full bg-base-200 overflow-hidden border-2 border-base-300 relative group cursor-pointer">
                      {displayImage ? (
                        <img
                          src={displayImage}
                          className="w-full h-full object-cover"
                          alt="Profile"
                        />
                      ) : (
                        <User className="w-full h-full p-6 text-base-content/20" />
                      )}

                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Camera className="w-6 h-6 text-white" />
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handlePhotoUpload}
                        disabled={submitting}
                      />
                    </div>
                    <span className="text-[10px] text-base-content/40">
                      Click to change
                    </span>
                  </div>

                  <div className="flex-1 w-full space-y-4">
                    <div className="form-control">
                      <label className="label pt-0 font-bold text-xs uppercase text-base-content/50">
                        Role
                      </label>
                      <select
                        className="select select-bordered w-full rounded-lg"
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as any,
                          })
                        }
                      >
                        <option value="CORE_MEMBER">Student Core Member</option>
                        <option value="FACULTY_MENTOR">Faculty Mentor</option>
                        <option value="CONVENER">Convener</option>
                        <option value="DEPUTY_CONVENER">Deputy Convener</option>
                      </select>
                    </div>
                    <div className="form-control">
                      <label className="label pt-0 font-bold text-xs uppercase text-base-content/50">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="input input-bordered w-full rounded-lg"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        placeholder="e.g. Dr. Pankaj Kumar"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label pt-0 font-bold text-xs uppercase text-base-content/50">
                      Designation
                    </label>
                    <input
                      type="text"
                      className="input input-bordered rounded-lg"
                      placeholder="e.g. Professor / Student"
                      value={formData.designation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          designation: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="label pt-0 font-bold text-xs uppercase text-base-content/50">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input input-bordered rounded-lg"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label pt-0 font-bold text-xs uppercase text-base-content/50">
                      Student ID (Optional for Faculty)
                    </label>
                    <input
                      type="text"
                      className="input input-bordered rounded-lg"
                      placeholder="e.g. 202201xxx"
                      value={formData.studentId || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          studentId: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="modal-action mt-4">
                  <button
                    type="button"
                    className="btn rounded-lg"
                    onClick={() => setIsModalOpen(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary rounded-lg px-8 gap-2"
                    disabled={submitting}
                  >
                    {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <dialog
        className={`modal ${
          memberToDelete ? "modal-open" : ""
        } modal-bottom sm:modal-middle backdrop-blur-sm`}
      >
        <div className="modal-box rounded-2xl">
          <h3 className="font-bold text-lg text-error flex gap-2 items-center">
            <AlertTriangle className="w-6 h-6" />
            Remove Member?
          </h3>
          <p className="py-4">
            Are you sure you want to remove{" "}
            <strong>{memberToDelete?.name}</strong> from the committee?
            <br />
            This action cannot be undone.
          </p>
          <div className="modal-action">
            <button
              className="btn rounded-lg"
              onClick={() => setMemberToDelete(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-error rounded-lg text-white"
              onClick={confirmDelete}
            >
              Yes, Remove
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={() => setMemberToDelete(null)}>close</button>
        </form>
      </dialog>
    </div>
  );
}

// --- SUB COMPONENTS ---

const MemberCard = ({
  member,
  onEdit,
  onDelete,
  bgClass = "bg-base-100",
  badgeColor = "badge-ghost",
}: {
  member: CommitteeMember;
  onEdit: () => void;
  onDelete: () => void;
  bgClass?: string;
  badgeColor?: string;
}) => {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  // Helper to prevent double slashing or missing slashes in image URLs
  const getImgUrl = (path?: string) => {
    if (!path) return null;
    // If it's a blob URL (local preview), use it as is
    if (path.startsWith("blob:")) return path;
    // If it's already an absolute URL, use it
    if (path.startsWith("http")) return path;

    // Otherwise append to base
    return `${API_BASE}${path}`;
  };

  const imgUrl = getImgUrl(member.photoUrl);

  return (
    <div
      className={`card shadow-sm border border-base-200 ${bgClass} transition-all hover:shadow-md group rounded-xl overflow-hidden`}
    >
      <div className="card-body p-5 flex flex-row items-center gap-4">
        <div className="avatar">
          <div className="w-16 h-16 rounded-full ring ring-base-300 ring-offset-base-100 ring-offset-2 overflow-hidden bg-base-200">
            {imgUrl ? (
              <img src={imgUrl} alt={member.name} className="object-cover" />
            ) : (
              <User className="w-full h-full p-4 text-base-content/30" />
            )}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg truncate" title={member.name}>
            {member.name}
          </h3>
          <div className={`badge ${badgeColor} badge-sm mb-1.5 border-none`}>
            {member.designation}
          </div>
          <div
            className="flex items-center gap-1 text-xs text-base-content/60 truncate"
            title={member.email}
          >
            <Mail className="w-3 h-3" /> {member.email}
          </div>
          {member.studentId && (
            <div className="text-xs text-gray-400 font-mono">
              ID: {member.studentId}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="btn btn-square btn-xs rounded-full btn-ghost text-blue-600 hover:bg-blue-100"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="btn btn-square btn-xs rounded-full btn-ghost text-red-600 hover:bg-red-100"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const EmptySlot = ({ title }: { title: string }) => (
  <div className="card bg-base-100 border-2 border-dashed border-base-200 p-6 flex items-center justify-center text-base-content/40 rounded-xl">
    <span className="text-sm font-medium">No {title} Assigned</span>
  </div>
);
