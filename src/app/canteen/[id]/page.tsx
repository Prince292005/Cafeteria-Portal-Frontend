"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, notFound } from "next/navigation";
import Link from "next/link";

// Icons
import {
  ArrowLeft,
  Info,
  MessageSquarePlus,
  History,
  ShieldCheck,
  Store,
  FileText, // Menu Icon
  ExternalLink,
} from "lucide-react";

// Relative imports
import { getPublicCanteenById, Canteen } from "../../../services/publicService";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

// Placeholder for Image Blur
const PLACEHOLDER_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSIjZTU1ZWRlIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiAvPjwvc3ZnPg==";

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
        // console.log("Canteen Data: ", canteenData);
        setCanteen(canteenData);
      } catch (err) {
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
      <div className="flex items-center justify-center min-h-screen bg-base-200/30">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (!canteen) return null;

  return (
    <div className="min-h-screen bg-base-200/30">
      <div className="w-full p-4 md:p-8">
        {/* --- HEADER --- */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="btn btn-circle btn-ghost hover:bg-base-300"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Store className="w-8 h-8 text-primary" />
              Canteen Profile
            </h1>
            <p className="text-base-content/70">
              View details, certifications, and menu.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- SIDEBAR --- */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="card bg-base-100 shadow-lg border border-base-200 sticky top-6 overflow-hidden">
              <div className="bg-base-200/50 p-4 border-b border-base-200">
                <h3 className="font-bold text-lg">Actions</h3>
              </div>
              <div className="card-body p-2">
                <ul className="menu w-full p-0 gap-1">
                  <li>
                    <a className="active font-medium bg-primary/10 text-primary hover:bg-primary/20 border-l-4 border-primary rounded-r-lg rounded-l-none">
                      <Info className="w-5 h-5" /> Canteen Details
                    </a>
                  </li>
                  <li>
                    <Link
                      href={`/complaints`}
                      className="font-medium hover:bg-base-200 border-l-4 border-transparent"
                    >
                      <MessageSquarePlus className="w-5 h-5" /> File a Complaint
                    </Link>
                  </li>
                  <li>
                    <Link
                      href={`/complaints-history`}
                      className="font-medium hover:bg-base-200 border-l-4 border-transparent"
                    >
                      <History className="w-5 h-5" /> Complaint History
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT --- */}
          <div className="flex-grow">
            <div className="card bg-base-100 shadow-xl border border-base-200 overflow-hidden">
              {/* Hero Image */}
              <figure className="relative h-64 md:h-80 w-full bg-neutral">
                <img
                  src={getImageUrl(canteen.imageUrl) || "/placeholder.jpg"} // Use helper or fallback
                  alt={canteen.canteenName}
                  className="object-cover w-full h-full opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full">
                  <div className="flex flex-wrap gap-3 mb-3">
                    <div className="badge badge-success gap-1.5 border-none text-white shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>{" "}
                      Open Now
                    </div>
                    <div className="badge badge-outline text-white/80 border-white/40">
                      ID: {canteen.id}
                    </div>
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg tracking-tight">
                    {canteen.canteenName}
                  </h1>
                </div>
              </figure>

              <div className="card-body p-6 md:p-10">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {/* Left: Description */}
                  <div className="prose max-w-none">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-base-content">
                      <Info className="w-5 h-5 text-primary" /> About this
                      Canteen
                    </h3>
                    <p className="text-base-content/70 leading-relaxed text-lg">
                      {canteen.info ||
                        "Welcome to our canteen. We serve fresh and healthy meals for students and staff."}
                    </p>
                  </div>

                  {/* Right Column: Menu & Safety */}
                  <div className="flex flex-col gap-6">
                    {/* ✅ NEW: Menu Card */}
                    <div className="card bg-orange-50 border border-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white text-orange-500 rounded-xl shadow-sm border border-orange-100">
                          <FileText className="w-8 h-8" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-orange-900">
                            Daily Menu
                          </h4>
                          <p className="text-sm text-orange-700/80 mt-1 leading-relaxed">
                            Check out today's specials and regular items.
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
                                className="btn btn-sm rounded-lg btn-warning text-white w-full sm:w-auto gap-2 shadow-sm"
                              >
                                <ExternalLink className="w-4 h-4" /> View Full
                                Menu
                              </a>
                            ) : (
                              <div className="badge badge-ghost bg-white/50 text-orange-400 border-orange-200 p-3">
                                Menu Coming Soon
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Safety Card */}
                    <div className="card bg-base-200/50 border border-base-200 p-6 rounded-2xl">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 text-green-700 rounded-xl shadow-sm">
                          <ShieldCheck className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg">
                            Safety & Hygiene
                          </h4>
                          <p className="text-sm text-base-content/60 mt-1 leading-relaxed">
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
                            className="btn btn-sm btn-outline rounded-lg btn-success gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" /> View FSSAI Cert
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
