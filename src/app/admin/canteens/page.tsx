"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "../../../contexts/authContext";
import {
  addCanteen,
  updateCanteen,
  deleteCanteen,
  Canteen,
  CanteenFormData,
} from "../../../services/canteenService";
import { getPublicCanteens } from "@/services/publicService";
import { uploadCanteenAsset } from "@/services/adminService";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Store,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  ImageIcon,
  ShieldCheck,
  FileText,
  Loader2,
  CheckCircle,
  Info,
  Lock,
  X,
  LayoutGrid,
  MoreHorizontal,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function AdminCanteensPage() {
  const { user, loading: isAuthLoading, logout } = useUser();
  const router = useRouter();

  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);

  const [formData, setFormData] = useState<CanteenFormData>({
    canteenName: "",
    info: "",
    fssaiCertificateUrl: "",
    imageUrl: "",
    menuFilePath: "",
  });

  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [canteenToDelete, setCanteenToDelete] = useState<Canteen | null>(null);

  const fetchCanteens = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getPublicCanteens();
      setCanteens(data);
    } catch (err: any) {
      toast.error("Failed to load canteens");
      if (err.message.includes("Unauthorized")) {
        logout();
        router.push("/login");
      }
    } finally {
      setLoading(false);
    }
  }, [logout, router]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user && user.role?.toUpperCase() === "ROLE_ADMIN") {
        fetchCanteens();
      } else if (!user) {
        setLoading(false);
      }
    }
  }, [isAuthLoading, user, fetchCanteens]);

  // --- Handlers ---

  const handleOpenAddModal = () => {
    setSelectedCanteen(null);
    setFormData({
      canteenName: "",
      info: "",
      fssaiCertificateUrl: "",
      imageUrl: "",
      menuFilePath: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (canteen: Canteen) => {
    setSelectedCanteen(canteen);
    setFormData({
      canteenName: canteen.canteenName,
      info: canteen.info,
      fssaiCertificateUrl: canteen.fssaiCertificateUrl || "",
      imageUrl: canteen.imageUrl || "",
      menuFilePath: canteen.menuFilePath || (canteen as any).menuFilePath || "",
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCanteen(null);
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    assetType: "image" | "fssai" | "menu"
  ) => {
    if (!e.target.files || !e.target.files[0]) return;

    if (!selectedCanteen?.id) {
      toast.error("Please save the canteen basic info first.");
      return;
    }

    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size too large (Max 10MB)");
      return;
    }

    setUploadingField(assetType);
    const toastId = toast.loading(`Uploading ${assetType}...`);

    try {
      await uploadCanteenAsset(selectedCanteen.id, assetType, file);

      let prefix =
        assetType === "image"
          ? "canteen_"
          : assetType === "fssai"
          ? "fssai_"
          : "menu_";
      let folder =
        assetType === "image"
          ? "/images/"
          : assetType === "fssai"
          ? "/certificates/"
          : "/menus/";

      const newPath = `${folder}${prefix}${selectedCanteen.id}_${file.name}`;

      const fieldName =
        assetType === "image"
          ? "imageUrl"
          : assetType === "fssai"
          ? "fssaiCertificateUrl"
          : "menuFilePath";

      setFormData((prev) => ({ ...prev, [fieldName]: newPath }));

      setSelectedCanteen((prev) =>
        prev
          ? {
              ...prev,
              imageUrl: assetType === "image" ? newPath : prev.imageUrl,
              fssaiCertificateUrl:
                assetType === "fssai" ? newPath : prev.fssaiCertificateUrl,
              menuFile: assetType === "menu" ? newPath : (prev as any).menuFile,
              menuFilePath:
                assetType === "menu" ? newPath : (prev as any).menuFilePath,
            }
          : null
      );

      toast.success("Uploaded successfully!", { id: toastId });
      fetchCanteens();
    } catch (error) {
      console.error(error);
      toast.error("Upload failed", { id: toastId });
    } finally {
      setUploadingField(null);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(
      selectedCanteen ? "Updating..." : "Creating..."
    );

    try {
      if (selectedCanteen) {
        await updateCanteen(selectedCanteen.id, formData);
        toast.success("Canteen updated!", { id: toastId });
        handleCloseModal();
        fetchCanteens();
      } else {
        // 1. Add Canteen (returns string message or object, but likely string based on error)
        await addCanteen(formData);
        toast.success("Canteen created! You can now upload files.", {
          id: toastId,
        });

        // 2. Fetch fresh data to get the ID
        const latestCanteens = await getPublicCanteens();
        setCanteens(latestCanteens);

        // 3. Find the newly created canteen (assuming unique name or latest ID)
        // Sorting by ID descending is safest if names aren't unique
        const newCanteen =
          latestCanteens.find((c) => c.canteenName === formData.canteenName) ||
          latestCanteens[latestCanteens.length - 1];

        if (newCanteen) {
          setSelectedCanteen(newCanteen);
          // Update form data with any defaults from backend
          setFormData({
            canteenName: newCanteen.canteenName,
            info: newCanteen.info,
            fssaiCertificateUrl: newCanteen.fssaiCertificateUrl || "",
            imageUrl: newCanteen.imageUrl || "",
            menuFilePath: "",
          });
        } else {
          // Fallback if not found (should rarely happen)
          handleCloseModal();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Operation failed", { id: toastId });
    }
  };

  const handleDelete = async () => {
    if (!canteenToDelete) return;
    const toastId = toast.loading("Deleting...");
    try {
      await deleteCanteen(canteenToDelete.id);
      toast.success("Canteen deleted", { id: toastId });
      setCanteenToDelete(null);
      fetchCanteens();
    } catch (err: any) {
      toast.error("Delete failed", { id: toastId });
    }
  };

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}?t=${new Date().getTime()}`;
  };

  if (isAuthLoading)
    return (
      <div className="flex h-screen items-center justify-center">
        <span className="loading loading-lg loading-spinner text-primary"></span>
      </div>
    );

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Store className="w-8 h-8 text-blue-500" /> Canteen Management
            </h1>
            <p className="text-base-content/70">
              Manage facilities, menus, and visual assets.
            </p>
          </div>
        </div>
        <button
          className="btn btn-primary gap-2 w-full md:w-auto shadow-lg rounded-lg"
          onClick={handleOpenAddModal}
        >
          <Plus className="w-5 h-5" /> Add New Canteen
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-base-content/50">Loading canteens...</p>
        </div>
      ) : canteens.length === 0 ? (
        <div className="text-center py-24 bg-base-200/30 rounded-3xl border-2 border-dashed border-base-300">
          <Store className="w-16 h-16 mx-auto text-base-content/10 mb-4" />
          <h3 className="text-lg font-bold opacity-60">No Facilities Found</h3>
          <p className="text-base-content/50 mb-6">
            Get started by setting up your first canteen.
          </p>
          <button
            className="btn btn-primary btn-sm gap-2 rounded-lg"
            onClick={handleOpenAddModal}
          >
            <Plus className="w-4 h-4" /> Add Canteen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {canteens.map((canteen) => (
            <div
              key={canteen.id}
              className="card bg-base-100 shadow-xl border border-base-200 hover:shadow-2xl transition-all duration-300 group"
            >
              {/* Image Preview */}
              <figure className="h-48 w-full bg-base-200 relative overflow-hidden">
                {canteen.imageUrl ? (
                  <img
                    src={getImageUrl(canteen.imageUrl)!}
                    alt={canteen.canteenName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full w-full text-base-content/20 bg-base-100">
                    <ImageIcon className="w-12 h-12 mb-2 opacity-50" />
                    <span className="text-xs font-bold uppercase tracking-widest opacity-50">
                      No Image
                    </span>
                  </div>
                )}

                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="btn btn-circle btn-sm bg-white/90 border-none hover:bg-white text-blue-600 shadow-sm"
                    onClick={() => handleOpenEditModal(canteen)}
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    className="btn btn-circle btn-sm bg-white/90 border-none hover:bg-white text-red-600 shadow-sm"
                    onClick={() => setCanteenToDelete(canteen)}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute bottom-2 right-2 badge badge-neutral/80 backdrop-blur-md font-mono text-xs text-white border-none">
                  ID: {canteen.id}
                </div>
              </figure>

              <div className="card-body p-6">
                <div className="flex justify-between items-start">
                  <h2
                    className="card-title text-xl font-bold line-clamp-1"
                    title={canteen.canteenName}
                  >
                    {canteen.canteenName}
                  </h2>
                </div>

                <p className="text-base-content/70 text-sm line-clamp-2 min-h-[2.5em] mt-1">
                  {canteen.info}
                </p>

                <div className="flex gap-2 mt-4">
                  {canteen.fssaiCertificateUrl ? (
                    <div className="badge badge-success badge-outline gap-1 p-3">
                      <ShieldCheck className="w-3 h-3" /> FSSAI Verified
                    </div>
                  ) : (
                    <div className="badge badge-ghost gap-1 p-3 opacity-50">
                      <AlertTriangle className="w-3 h-3" /> No Cert
                    </div>
                  )}
                  {(canteen.menuFilePath || (canteen as any).menuFile) && (
                    <div className="badge badge-warning badge-outline gap-1 p-3">
                      <FileText className="w-3 h-3" /> Menu Added
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <dialog
        className={`modal ${
          isModalOpen ? "modal-open" : ""
        } modal-bottom sm:modal-middle backdrop-blur-sm`}
      >
        <div className="modal-box w-11/12 max-w-2xl p-0 flex flex-col max-h-[90vh] rounded-2xl bg-base-100 shadow-2xl">
          {/* Header */}
          <div className="bg-base-100 px-8 py-5 border-b border-base-200 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-base-200`}>
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-xl leading-tight">
                  {selectedCanteen ? "Edit Canteen" : "Add New Canteen"}
                </h3>
                <p className="text-xs text-base-content/50 font-medium">
                  Manage details and uploads
                </p>
              </div>
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost"
              onClick={handleCloseModal}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 overflow-y-auto flex-1">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-bold">Canteen Name</span>
                </label>
                <input
                  type="text"
                  name="canteenName"
                  value={formData.canteenName}
                  onChange={handleFormChange}
                  className="input input-bordered focus:input-primary w-full rounded-lg"
                  placeholder="e.g. North Cafeteria"
                  required
                />
              </div>
              <div className="form-control">
                <label className="label pt-0">
                  <span className="label-text font-bold">
                    Description / Info
                  </span>
                </label>
                <textarea
                  name="info"
                  value={formData.info}
                  onChange={handleFormChange}
                  className="textarea textarea-bordered h-24 focus:textarea-primary rounded-lg"
                  placeholder="Opening hours, location, special items..."
                  required
                />
              </div>

              <div className="divider my-0 text-xs text-base-content/30 font-bold uppercase tracking-widest">
                Assets Management
              </div>

              {/* Uploads Section */}
              <div className="relative space-y-4">
                {/* Lock Overlay */}
                {!selectedCanteen && (
                  <div className="absolute inset-0 z-10 bg-base-100/80 backdrop-blur-[1px] flex flex-col items-center justify-center border-2 border-dashed border-base-300 rounded-xl">
                    <Lock className="w-8 h-8 text-base-content/30 mb-2" />
                    <p className="font-bold text-base-content/60">
                      Assets Locked
                    </p>
                    <p className="text-xs text-base-content/40">
                      Create the canteen first to upload files.
                    </p>
                  </div>
                )}

                {/* 1. Banner Image */}
                <div className="form-control bg-base-50 p-3 rounded-xl border border-base-200">
                  <label className="label pt-0 pb-2 cursor-pointer justify-start gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    <span className="font-semibold text-sm">Banner Image</span>
                    {selectedCanteen?.imageUrl && (
                      <CheckCircle className="w-3 h-3 text-success ml-auto" />
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input file-input-bordered file-input-xs w-full file-input-primary mb-2"
                    onChange={(e) => handleFileUpload(e, "image")}
                    disabled={!selectedCanteen || !!uploadingField}
                  />
                  {/* Preview */}
                  {selectedCanteen?.imageUrl && (
                    <div className="mt-2 rounded-lg overflow-hidden h-24 border border-base-200 w-full">
                      <img
                        src={getImageUrl(selectedCanteen.imageUrl)!}
                        className="w-full h-full object-cover"
                        alt="preview"
                      />
                    </div>
                  )}
                </div>

                {/* 2. Menu */}
                <div className="form-control bg-base-50 p-3 rounded-xl border border-base-200">
                  <label className="label pt-0 pb-2 cursor-pointer justify-start gap-2">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span className="font-semibold text-sm">
                      Daily Menu (PDF/Image)
                    </span>
                    {(selectedCanteen?.menuFilePath ||
                      (selectedCanteen as any)?.menuFile) && (
                      <CheckCircle className="w-3 h-3 text-success ml-auto" />
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="file-input file-input-bordered file-input-xs w-full file-input-warning mb-2"
                    onChange={(e) => handleFileUpload(e, "menu")}
                    disabled={!selectedCanteen || !!uploadingField}
                  />
                </div>

                {/* 3. Certificate */}
                <div className="form-control bg-base-50 p-3 rounded-xl border border-base-200">
                  <label className="label pt-0 pb-2 cursor-pointer justify-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    <span className="font-semibold text-sm">
                      FSSAI Certificate
                    </span>
                    {selectedCanteen?.fssaiCertificateUrl && (
                      <CheckCircle className="w-3 h-3 text-success ml-auto" />
                    )}
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    className="file-input file-input-bordered file-input-xs w-full file-input-success mb-2"
                    onChange={(e) => handleFileUpload(e, "fssai")}
                    disabled={!selectedCanteen || !!uploadingField}
                  />
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="p-5 border-t border-base-200 bg-base-50 flex justify-end gap-3 shrink-0 rounded-b-2xl">
            <button
              type="button"
              className="btn btn-ghost rounded-lg text-base-content/60"
              onClick={handleCloseModal}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary rounded-lg px-6"
              onClick={(e) => handleSubmit(e as any)}
              disabled={!!uploadingField}
            >
              {uploadingField ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : selectedCanteen ? (
                "Save Changes"
              ) : (
                "Create Canteen"
              )}
            </button>
          </div>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>

      {/* Delete Modal */}
      <dialog
        className={`modal ${
          canteenToDelete ? "modal-open" : ""
        } modal-bottom sm:modal-middle backdrop-blur-sm`}
      >
        <div className="modal-box">
          <h3 className="font-bold text-lg text-error flex gap-2">
            <AlertTriangle /> Delete Facility?
          </h3>
          <p className="py-4 text-sm">
            Are you sure you want to delete{" "}
            <strong>{canteenToDelete?.canteenName}</strong>? This cannot be
            undone.
          </p>
          <div className="modal-action">
            <button
              className="btn btn-sm rounded-lg"
              onClick={() => setCanteenToDelete(null)}
            >
              Cancel
            </button>
            <button
              className="btn btn-sm btn-error rounded-lg"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}
