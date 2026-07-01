"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";

import {
  ArrowLeft,
  Info,
  MessageSquarePlus,
  History,
  ShieldCheck,
  Store,
  FileText,
  ExternalLink,
} from "lucide-react";

import { getPublicCanteenById, Canteen } from "../../../services/publicService";
import QuickFeedbackWidget from "@/components/feedback/QuickFeedbackWidget";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export default function CanteenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [canteen, setCanteen] = useState<Canteen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const canteenData = await getPublicCanteenById(id);
        setCanteen(canteenData);
      } catch {
        notFound();
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const getImageUrl = (path?: string) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${API_BASE_URL}${path}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--paper-dim)]">
        <span className="loading loading-spinner loading-lg text-[var(--turmeric)]"></span>
      </div>
    );
  }

  if (!canteen) return null;

  return (
    <div className="min-h-screen bg-[var(--paper-dim)]">
      <div className="w-full p-4 md:p-8">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--ink-soft)] hover:bg-white hover:text-[var(--ink)] transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="font-display text-3xl text-[var(--ink)] flex items-center gap-3">
              <Store className="w-7 h-7 text-[var(--turmeric)]" />
              Canteen profile
            </h1>
            <p className="text-[var(--ink-soft)] text-sm mt-1">
              View details, certifications, and menu.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- SIDEBAR --- */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white rounded-2xl border border-[var(--kraft-border)] shadow-sm sticky top-6 overflow-hidden">
              <div className="bg-[var(--paper-dim)] p-4 border-b border-[var(--kraft-border)]">
                <h3 className="font-display text-lg text-[var(--ink)]">
                  Actions
                </h3>
              </div>
              <div className="p-2">
                <ul className="flex flex-col gap-1">
                  <li>
                    <span className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium bg-[var(--turmeric)]/10 text-[var(--turmeric)] border-l-4 border-[var(--turmeric)]">
                      <Info className="w-5 h-5" /> Canteen details
                    </span>
                  </li>
                  <li>
                    <Link
                      href="/complaints"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] border-l-4 border-transparent transition-colors"
                    >
                      <MessageSquarePlus className="w-5 h-5" /> File a complaint
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/complaints-history"
                      className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-[var(--ink-soft)] hover:bg-[var(--paper-dim)] border-l-4 border-transparent transition-colors"
                    >
                      <History className="w-5 h-5" /> Complaint history
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-grow">
            <div className="bg-white rounded-2xl border border-[var(--kraft-border)] shadow-sm overflow-hidden">
              {/* Hero Image */}
              <div className="relative h-64 md:h-80 w-full bg-[var(--espresso)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getImageUrl(canteen.imageUrl) || "/placeholder.jpg"}
                  alt={canteen.canteenName}
                  className="object-cover w-full h-full opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="inline-flex items-center gap-1.5 text-xs font-semibold bg-[var(--chalk-green)] text-white px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      Open now
                    </div>
                    <div className="inline-flex items-center text-xs font-semibold text-white/80 border border-white/30 px-3 py-1.5 rounded-full">
                      ID: {canteen.id}
                    </div>
                  </div>
                  <h1 className="font-display text-4xl md:text-5xl text-white drop-shadow-lg">
                    {canteen.canteenName}
                  </h1>
                </div>
              </div>

              <div className="p-6 md:p-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left: Description */}
                  <div>
                    <h3 className="font-display text-xl text-[var(--ink)] mb-4 flex items-center gap-2">
                      <Info className="w-5 h-5 text-[var(--turmeric)]" /> About
                      this canteen
                    </h3>
                    <p className="text-[var(--ink-soft)] leading-relaxed text-lg">
                      {canteen.info ||
                        "Welcome to our canteen. We serve fresh and healthy meals for students and staff."}
                    </p>
                  </div>

                  {/* Right Column: Menu, Feedback & Safety */}
                  <div className="flex flex-col gap-6">
                    {/* Menu Card */}
                    <div className="bg-[var(--turmeric)]/6 border border-[var(--turmeric)]/15 p-6 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white text-[var(--turmeric)] rounded-xl shadow-sm border border-[var(--turmeric)]/15">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-display text-lg text-[var(--turmeric-deep)]">
                            Daily menu
                          </h4>
                          <p className="text-sm text-[var(--ink-soft)] mt-1 leading-relaxed">
                            Check out today&apos;s specials and regular items.
                          </p>

                          <div className="mt-4">
                            {canteen.menuFilePath ? (
                              <a
                                href={
                                  getImageUrl(
                                    `${API_BASE_URL}${canteen.menuFilePath}`
                                  )!
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm font-semibold bg-[var(--turmeric)] text-white px-4 py-2.5 rounded-lg hover:bg-[var(--turmeric-deep)] transition-colors w-full sm:w-auto justify-center"
                              >
                                <ExternalLink className="w-4 h-4" /> View full
                                menu
                              </a>
                            ) : (
                              <span className="inline-block text-xs font-medium bg-white text-[var(--turmeric)]/60 border border-[var(--turmeric)]/20 px-3 py-2 rounded-lg">
                                Menu coming soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* One-tap quick feedback */}
                    <QuickFeedbackWidget canteenId={canteen.id} />

                    {/* Safety Card */}
                    <div className="bg-[var(--paper-dim)] border border-[var(--kraft-border)] p-6 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-[var(--chalk-green)]/10 text-[var(--chalk-green)] rounded-xl shadow-sm">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-display text-lg text-[var(--ink)]">
                            Safety &amp; hygiene
                          </h4>
                          <p className="text-sm text-[var(--ink-soft)] mt-1 leading-relaxed">
                            This establishment adheres to strict food safety
                            protocols.
                          </p>
                        </div>
                      </div>
                      {canteen.fssaiCertificateUrl && (
                        <div className="mt-4 flex justify-end">
                          <a
                            href={getImageUrl(canteen.fssaiCertificateUrl)!}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--chalk-green)] border border-[var(--chalk-green)]/30 px-4 py-2 rounded-lg hover:bg-[var(--chalk-green)]/10 transition-colors"
                          >
                            <ShieldCheck className="w-4 h-4" /> View FSSAI cert
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
