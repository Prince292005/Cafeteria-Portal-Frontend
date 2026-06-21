"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Send,
  FileText,
  Info,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  Store,
  ArrowLeft,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import {
  createComplaint,
  uploadImageToS3,
  attachImageToComplaint,
} from "@/services/complaintService";
import { getPublicCanteens, Canteen } from "@/services/publicService";
import toast from "react-hot-toast";

// Simple in-memory cache to prevent refetching on navigation
const canteenCache: Canteen[] | null = null;

export default function FileComplaintPage() {
  const router = useRouter();

  // --- State ---
  const [canteens, setCanteens] = useState<Canteen[]>(canteenCache || []);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("");
  const [formData, setFormData] = useState({ title: "", description: "" });

  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingCanteens, setFetchingCanteens] = useState(!canteenCache);
  const [isSuccess, setIsSuccess] = useState(false);

  const MAX_TITLE = 100;
  const MAX_DESC = 1000;

  // --- Optimized Fetch ---
  useEffect(() => {
    if (canteenCache) {
      setCanteens(canteenCache);
      setFetchingCanteens(false);
      return;
    }

    const fetchCanteens = async () => {
      try {
        const data = await getPublicCanteens();
        setCanteens(data);
        // Update cache (in a real app, use React Query/SWR)
        (window as any).__canteenCache = data;
      } catch (error) {
        console.error("Failed to load canteens", error);
        toast.error("Could not load facility list");
      } finally {
        setFetchingCanteens(false);
      }
    };
    fetchCanteens();
  }, []);

  // --- File Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large (Max 5MB)");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // --- Submit Handler ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCanteenId) {
      toast.error("Please select a canteen.");
      return;
    }
    if (!formData.title.trim() || !formData.description.trim()) return;

    setLoading(true);
    const loadingToast = toast.loading("Submitting complaint...");

    try {
      // 1. Create Complaint
      const response = await createComplaint({
        canteenId: selectedCanteenId,
        title: formData.title,
        description: formData.description,
      });

      const { complainId, uploadUrl, imageKey } = response;

      // 2. Handle Image Upload (only if file exists AND backend gave us a URL)
      if (selectedFile && uploadUrl && imageKey) {
        toast.loading("Uploading proof...", { id: loadingToast });
        await uploadImageToS3(uploadUrl, selectedFile);
        await attachImageToComplaint(complainId, imageKey);
      }

      toast.success("Complaint filed successfully!", { id: loadingToast });
      setIsSuccess(true);

      setTimeout(() => router.push("/"), 2000);
    } catch (error) {
      console.error("Failed:", error);
      toast.error("Failed to submit. Please try again.", { id: loadingToast });
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
        <div className="card w-full max-w-md bg-white shadow-xl rounded-2xl animate-in zoom-in-95 duration-300">
          <div className="card-body items-center text-center p-12">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Complaint Submitted
            </h2>
            <p className="text-gray-500 text-sm">
              Your report has been filed successfully.
            </p>
            <p className="text-xs text-gray-400 mt-8 animate-pulse">
              Redirecting to home...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-xl mb-6">
        <Link
          href="/"
          className="btn btn-ghost rounded-lg btn-sm gap-2 text-gray-500 hover:text-gray-900 hover:bg-gray-200 transition-colors pl-0"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      <div className="card w-full max-w-xl bg-white shadow-xl border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-white">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-red-600" />
            Submit a Complaint
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            Report an issue with food quality, hygiene, or service.
          </p>
        </div>

        <div className="p-8 bg-gray-50/30">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Canteen Selector */}
            <div className="form-control w-full">
              <label className="label-text font-semibold text-gray-700 text-base mb-2 flex items-center gap-2">
                Select Facility <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Store className="w-5 h-5" />
                </div>
                <select
                  className="select w-full pl-12 bg-white border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-lg transition-all shadow-sm font-normal text-base"
                  value={selectedCanteenId}
                  onChange={(e) => setSelectedCanteenId(e.target.value)}
                  disabled={fetchingCanteens}
                  required
                >
                  <option value="" disabled>
                    {fetchingCanteens ? "Loading..." : "-- Select a Canteen --"}
                  </option>
                  {canteens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.canteenName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subject */}
            <div className="form-control w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="label-text font-semibold text-gray-700 text-base flex items-center gap-2">
                  Issue Subject <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    formData.title.length >= MAX_TITLE
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {formData.title.length}/{MAX_TITLE}
                </span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <FileText className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Hygiene concern..."
                  className="input w-full pl-12 bg-white border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-lg transition-all shadow-sm"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  maxLength={MAX_TITLE}
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-control w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="label-text font-semibold text-gray-700 text-base flex items-center gap-2">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    formData.description.length >= MAX_DESC
                      ? "text-red-500"
                      : "text-gray-400"
                  }`}
                >
                  {formData.description.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                className="textarea w-full h-32 bg-white border-gray-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 rounded-lg transition-all shadow-sm resize-none text-base leading-relaxed p-4"
                placeholder="Describe the incident details..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                maxLength={MAX_DESC}
              ></textarea>
            </div>

            {/* --- IMAGE UPLOAD SECTION --- */}
            <div className="form-control w-full">
              <label className="label-text font-semibold text-gray-700 text-base mb-2 flex items-center gap-2">
                Attach Proof{" "}
                <span className="text-gray-400 font-normal text-xs">
                  (Optional)
                </span>
              </label>

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-red-400 hover:bg-red-50 transition-all group bg-white"
                >
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2 group-hover:bg-white group-hover:shadow-sm transition-all border border-gray-100">
                    <ImageIcon className="w-6 h-6 text-gray-400 group-hover:text-red-500" />
                  </div>
                  <p className="text-sm font-medium text-gray-600 group-hover:text-red-600">
                    Click to upload image
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    JPG, PNG (Max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-white flex items-center p-2 gap-3 shadow-sm">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 border border-gray-100">
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Info Box */}
            <div className="flex gap-3 p-3 bg-blue-50 text-blue-800 rounded-lg text-xs border border-blue-100 items-start leading-relaxed">
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                Reports are reviewed by the <strong>Administration</strong>.
                Providing proof helps speed up resolution.
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-4 border-t border-gray-200 mt-2">
              <Link
                href="/"
                className="btn btn-ghost rounded-lg text-gray-600 hover:bg-gray-100 px-6 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={
                  loading || !selectedCanteenId || !formData.title.trim()
                }
                className="btn bg-red-600 rounded-lg hover:bg-red-700 text-white border-none shadow-md hover:shadow-lg px-8 font-semibold gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Submit Report
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-gray-400 mt-8">
        © 2025 Cafeteria Portal. All rights reserved.
      </p>
    </div>
  );
}
