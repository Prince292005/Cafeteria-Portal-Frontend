"use client";

import React, { useState, useEffect, useRef } from "react";
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
import { useUser } from "@/contexts/authContext";

const canteenCache: Canteen[] | null = null;

export default function FileComplaintPage() {
  const { user, loading: authLoading } = useUser();

  const [canteens, setCanteens] = useState<Canteen[]>(canteenCache || []);
  const [selectedCanteenId, setSelectedCanteenId] = useState<string>("");
  const [formData, setFormData] = useState({ title: "", description: "" });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetchingCanteens, setFetchingCanteens] = useState(!canteenCache);
  const [isSuccess, setIsSuccess] = useState(false);

  const MAX_TITLE = 100;
  const MAX_DESC = 1000;

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
        (window as unknown as { __canteenCache?: Canteen[] }).__canteenCache =
          data;
      } catch (error) {
        console.error("Failed to load canteens", error);
        toast.error("Could not load facility list");
      } finally {
        setFetchingCanteens(false);
      }
    };
    fetchCanteens();
  }, []);

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
      const response = await createComplaint({
        canteenId: selectedCanteenId,
        title: formData.title,
        description: formData.description,
      });

      const { complainId, uploadUrl, imageKey } = response;

      if (selectedFile && uploadUrl && imageKey) {
        toast.loading("Uploading proof...", { id: loadingToast });
        await uploadImageToS3(uploadUrl, selectedFile);
        await attachImageToComplaint(complainId, imageKey);
      }

      toast.success("Complaint filed successfully!", { id: loadingToast });
      setIsSuccess(true);
    } catch (error) {
      console.error("Failed:", error);
      toast.error("Failed to submit. Please try again.", { id: loadingToast });
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--paper)]">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--turmeric)]" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-[0_24px_48px_-24px_rgba(26,20,16,0.18)] border border-[var(--kraft-border)] p-10 max-w-lg w-full text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-[var(--paper-dim)] flex items-center justify-center">
            <ShieldAlert className="w-10 h-10 text-[var(--ink-soft)]" />
          </div>
          <h2 className="font-display text-3xl text-[var(--ink)] mb-3">
            Login required
          </h2>
          <p className="text-[var(--ink-soft)] mb-8 leading-relaxed">
            You must be logged in to submit a complaint.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] transition-colors"
            >
              Go back
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold bg-[var(--turmeric)] text-[var(--paper)] hover:bg-[var(--turmeric-deep)] transition-colors"
            >
              Login now
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--paper)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-[var(--kraft-border)] shadow-[0_24px_48px_-24px_rgba(26,20,16,0.18)] animate-in zoom-in-95 duration-300">
          <div className="p-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[var(--chalk-green)]/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-[var(--chalk-green)]" />
            </div>
            <h2 className="font-display text-2xl text-[var(--ink)] mb-2">
              Complaint submitted
            </h2>
            <p className="text-[var(--ink-soft)] text-sm leading-relaxed">
              Your complaint has been marked as{" "}
              <span className="inline-block text-xs font-semibold bg-amber-700/10 text-amber-800 px-2.5 py-0.5 rounded-full align-middle">
                Pending
              </span>
              . Our CMC team will review it shortly.
            </p>
            <p className="text-[var(--ink-soft)]/60 text-xs mt-2">
              You can track its progress anytime from Complaint History.
            </p>
            <div className="flex flex-col gap-3 w-full mt-8">
              <Link
                href="/complaints-history"
                className="inline-flex items-center justify-center gap-2 bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-lg w-full py-3.5 hover:bg-[var(--turmeric-deep)] transition-colors"
              >
                View Complaint History
              </Link>
              <button
                onClick={() => {
                  setIsSuccess(false);
                  setSelectedCanteenId("");
                  setFormData({ title: "", description: "" });
                  removeFile();
                }}
                className="rounded-lg w-full py-3 text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] font-medium transition-colors"
              >
                Submit another complaint
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--paper)] flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-xl mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>
      </div>

      <div className="w-full max-w-xl bg-white border border-[var(--kraft-border)] rounded-2xl overflow-hidden shadow-[0_24px_48px_-24px_rgba(26,20,16,0.14)]">
        <div className="px-8 py-7 border-b border-[var(--kraft-border)]">
          <h2 className="font-display text-3xl text-[var(--ink)] flex items-center gap-3">
            <span className="w-11 h-11 rounded-full bg-[var(--turmeric)]/10 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-6 h-6 text-[var(--turmeric)]" />
            </span>
            Submit a complaint
          </h2>
          <p className="text-sm text-[var(--ink-soft)] mt-3">
            Report an issue with food quality, hygiene, or service.
          </p>
          <Link
            href="/complaints-history"
            className="text-sm text-[var(--turmeric)] hover:text-[var(--turmeric-deep)] font-semibold mt-3 inline-flex items-center gap-1"
          >
            Already submitted a complaint? View Complaint History
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="p-8 bg-[var(--paper-dim)]/40">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full">
              <label className="label mb-2 flex items-center gap-1">
                Select facility <span className="text-[var(--turmeric)]">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--ink-soft)]/50">
                  <Store className="w-5 h-5" />
                </div>
                <select
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--kraft-border)] focus:border-[var(--turmeric)] rounded-lg transition-colors text-base text-[var(--ink)] appearance-none"
                  value={selectedCanteenId}
                  onChange={(e) => setSelectedCanteenId(e.target.value)}
                  disabled={fetchingCanteens}
                  required
                >
                  <option value="" disabled>
                    {fetchingCanteens ? "Loading..." : "-- Select a canteen --"}
                  </option>
                  {canteens.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.canteenName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="label flex items-center gap-1">
                  Issue subject <span className="text-[var(--turmeric)]">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    formData.title.length >= MAX_TITLE
                      ? "text-[var(--turmeric)]"
                      : "text-[var(--ink-soft)]/50"
                  }`}
                >
                  {formData.title.length}/{MAX_TITLE}
                </span>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[var(--ink-soft)]/50">
                  <FileText className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Hygiene concern..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[var(--kraft-border)] focus:border-[var(--turmeric)] rounded-lg transition-colors text-base text-[var(--ink)]"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  maxLength={MAX_TITLE}
                />
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between items-center mb-2">
                <label className="label flex items-center gap-1">
                  Detailed description{" "}
                  <span className="text-[var(--turmeric)]">*</span>
                </label>
                <span
                  className={`text-xs font-medium ${
                    formData.description.length >= MAX_DESC
                      ? "text-[var(--turmeric)]"
                      : "text-[var(--ink-soft)]/50"
                  }`}
                >
                  {formData.description.length}/{MAX_DESC}
                </span>
              </div>
              <textarea
                className="w-full h-32 bg-white border border-[var(--kraft-border)] focus:border-[var(--turmeric)] rounded-lg transition-colors resize-none text-base leading-relaxed p-4 text-[var(--ink)]"
                placeholder="Describe the incident details..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
                maxLength={MAX_DESC}
              ></textarea>
            </div>

            <div className="w-full">
              <label className="label mb-2 flex items-center gap-2">
                Attach proof{" "}
                <span className="text-[var(--ink-soft)]/50 font-normal text-xs normal-case">
                  (optional)
                </span>
              </label>

              {!selectedFile ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[var(--kraft-border)] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-[var(--turmeric)]/50 hover:bg-[var(--turmeric)]/5 transition-colors group bg-white"
                >
                  <div className="w-12 h-12 bg-[var(--paper-dim)] rounded-full flex items-center justify-center mb-2 group-hover:bg-[var(--turmeric)]/10 transition-colors">
                    <ImageIcon className="w-6 h-6 text-[var(--ink-soft)]/50 group-hover:text-[var(--turmeric)]" />
                  </div>
                  <p className="text-sm font-medium text-[var(--ink-soft)] group-hover:text-[var(--turmeric)]">
                    Click to upload image
                  </p>
                  <p className="text-xs text-[var(--ink-soft)]/50 mt-1">
                    JPG, PNG (max 5MB)
                  </p>
                </div>
              ) : (
                <div className="relative rounded-xl border border-[var(--kraft-border)] overflow-hidden bg-white flex items-center p-2 gap-3">
                  <div className="w-16 h-16 bg-[var(--paper-dim)] rounded-lg overflow-hidden shrink-0 border border-[var(--kraft-border)]">
                    {previewUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--ink)] truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[var(--ink-soft)]/60">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={removeFile}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--ink-soft)]/50 hover:text-[var(--turmeric)] hover:bg-[var(--turmeric)]/10 transition-colors"
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

            <div className="flex gap-3 p-4 bg-[var(--chalk-green)]/8 text-[var(--chalk-green)] rounded-lg text-xs border border-[var(--chalk-green)]/15 items-start leading-relaxed">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                Every complaint is reviewed by the{" "}
                <strong>Cafeteria Management Committee (CMC)</strong>. Track
                its progress anytime in{" "}
                <Link
                  href="/complaints-history"
                  className="underline font-semibold hover:opacity-80"
                >
                  Complaint History
                </Link>
                . Photos help us verify and resolve issues faster.
              </p>
            </div>

            <div className="hairline" />
            <div className="pt-1 flex items-center justify-end gap-3">
              <Link
                href="/"
                className="px-6 py-3 rounded-lg font-medium text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={
                  loading || !selectedCanteenId || !formData.title.trim()
                }
                className="inline-flex items-center justify-center gap-2 bg-[var(--turmeric)] text-[var(--paper)] font-semibold rounded-lg px-8 py-3.5 hover:bg-[var(--turmeric-deep)] transition-colors disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
                Submit report
              </button>
            </div>
          </form>
        </div>
      </div>

      <p className="text-center text-xs text-[var(--ink-soft)]/50 mt-8">
        © {new Date().getFullYear()} Cafeteria Portal. All rights reserved.
      </p>
    </div>
  );
}
