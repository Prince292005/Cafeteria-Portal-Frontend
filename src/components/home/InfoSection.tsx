"use client";

import React, { useEffect, useState } from "react";
import {
  Megaphone,
  Users,
  Calendar,
  Loader2,
  User,
  GraduationCap,
  Award,
  Mail,
} from "lucide-react";
import {
  getActiveAnnouncements,
  getCommitteeMembers,
  Announcement,
  CommitteeResponse,
} from "@/services/adminService";


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const InfoSection: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [committee, setCommittee] = useState<CommitteeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [annData, commData] = await Promise.all([
          getActiveAnnouncements(),
          getCommitteeMembers().catch(() => null),
        ]);

        setAnnouncements(annData);
        setCommittee(commData);
      } catch (error) {
        console.error("Failed to load info section data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getImgUrl = (path?: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  };

  return (
    <section className="pt-16 pb-20 bg-[var(--paper-dim)] border-t border-[var(--kraft-border)]">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Committee Members */}
        <div className="lg:col-span-1">
          <div className="card bg-[var(--paper)] sticky top-24 border border-[var(--kraft-border)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.18)] max-h-[600px] overflow-hidden flex flex-col">
            <div className="card-body p-6 flex flex-col h-full">
              <h2 className="font-display text-2xl flex items-center gap-2.5 mb-5">
                <Users className="text-[var(--turmeric)]" />
                CMC Team
              </h2>

              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-[var(--turmeric)]/40" />
                  </div>
                ) : !committee ? (
                  <p className="text-sm text-[var(--ink-soft)]/50 text-center py-4">
                    Committee info unavailable.
                  </p>
                ) : (
                  <>
                    {/* 1. Faculty Mentor */}
                    {committee.facultyMentor && (
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--ink-soft)]/60 mb-3 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                          <GraduationCap className="w-3 h-3" /> Mentor
                        </h3>
                        <div className="flex items-start gap-3 bg-[var(--turmeric)]/[0.06] p-3 rounded-xl border border-[var(--turmeric)]/15">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full ring-2 ring-[var(--turmeric)]/25 ring-offset-2 ring-offset-[var(--paper)]">
                              <img
                                src={
                                  getImgUrl(committee.facultyMentor.photoUrl) ||
                                  "/placeholder.png"
                                }
                                alt={committee.facultyMentor.name}
                                className="object-cover"
                              />
                            </div>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm text-[var(--ink)] truncate">
                              {committee.facultyMentor.name}
                            </p>
                            <p className="text-xs text-[var(--turmeric)] font-medium mb-1">
                              Faculty In-Charge
                            </p>
                            <div className="flex items-center gap-1 text-xs text-[var(--ink-soft)]/70 truncate">
                              <Mail className="w-3 h-3 shrink-0" />
                              <span className="truncate">
                                {committee.facultyMentor.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Conveners */}
                    {(committee.convener || committee.deputyConvener) && (
                      <div>
                        <h3 className="text-sm font-semibold text-[var(--ink-soft)]/60 mb-3 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                          <Award className="w-3 h-3" /> Leads
                        </h3>
                        <div className="space-y-3">
                          {committee.convener && (
                            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--paper-dim)] transition-colors">
                              <div className="avatar">
                                <div className="w-10 h-10 rounded-full bg-base-200">
                                  <img
                                    src={
                                      getImgUrl(committee.convener.photoUrl) ||
                                      "/placeholder.png"
                                    }
                                    alt={committee.convener.name}
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-[var(--ink)] truncate">
                                    {committee.convener.name}
                                  </p>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--turmeric)]/40 text-[var(--turmeric)]">
                                    Convener
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[var(--ink-soft)]/70 mt-1 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {committee.convener.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {committee.deputyConvener && (
                            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--paper-dim)] transition-colors">
                              <div className="avatar">
                                <div className="w-10 h-10 rounded-full bg-base-200">
                                  <img
                                    src={
                                      getImgUrl(
                                        committee.deputyConvener.photoUrl
                                      ) || "/placeholder.png"
                                    }
                                    alt={committee.deputyConvener.name}
                                    className="object-cover"
                                  />
                                </div>
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-semibold text-sm text-[var(--ink)] truncate">
                                    {committee.deputyConvener.name}
                                  </p>
                                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border border-[var(--chalk-green)]/40 text-[var(--chalk-green)]">
                                    Deputy
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-[var(--ink-soft)]/70 mt-1 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {committee.deputyConvener.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* 3. Core Members Grid */}
                    {committee.coreMembers &&
                      committee.coreMembers.length > 0 && (
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--ink-soft)]/60 mb-3 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                            <User className="w-3 h-3" /> Core Members
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {committee.coreMembers.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-2 bg-[var(--paper-dim)] rounded-lg border border-[var(--kraft-border)] hover:border-[var(--turmeric)]/30 transition-colors"
                              >
                                <div className="avatar">
                                  <div className="w-8 h-8 rounded-full">
                                    <img
                                      src={
                                        getImgUrl(member.photoUrl) ||
                                        "/placeholder.png"
                                      }
                                      alt={member.name}
                                      className="object-cover"
                                    />
                                  </div>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex justify-between items-center">
                                    <p className="text-xs font-bold text-[var(--ink)] truncate">
                                      {member.name}
                                    </p>
                                    <span className="text-[10px] text-[var(--ink-soft)]/60 truncate ml-2 max-w-[80px] text-right">
                                      {member.designation}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-[var(--ink-soft)]/70 truncate">
                                    <Mail className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">
                                      {member.email}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* CENTER: How feedback is handled */}
        <div className="lg:col-span-1 space-y-6">

          <div className="card bg-[var(--paper)] border border-[var(--kraft-border)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.18)]">
            <div className="card-body">
              <h2 className="font-display text-xl mb-4">
                How your feedback is handled
              </h2>
              <ol className="space-y-4">
                <li className="flex gap-3">
                  <span className="font-display text-lg text-[var(--turmeric)] shrink-0">
                    1
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      You rate or report
                    </p>
                    <p className="text-xs text-[var(--ink-soft)]/70 mt-0.5">
                      One tap on a canteen page, or a complaint with optional
                      photo proof.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-lg text-[var(--turmeric)] shrink-0">
                    2
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      CMC reviews it
                    </p>
                    <p className="text-xs text-[var(--ink-soft)]/70 mt-0.5">
                      Every entry feeds the committee&apos;s monthly canteen
                      report — nothing sits unread.
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="font-display text-lg text-[var(--turmeric)] shrink-0">
                    3
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[var(--ink)]">
                      You see the outcome
                    </p>
                    <p className="text-xs text-[var(--ink-soft)]/70 mt-0.5">
                      Track status — pending, in progress, resolved — anytime
                      in your complaint history.
                    </p>
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>

        {/* RIGHT: Announcements */}
        <div className="lg:col-span-1">
          <div className="card bg-[var(--paper)] sticky top-24 border border-[var(--kraft-border)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.18)]">
            <div className="card-body">
              <h2 className="font-display text-2xl flex items-center gap-2.5">
                <Megaphone className="text-[var(--turmeric)]" />
                Announcements
              </h2>

              <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--turmeric)]/50" />
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8 text-[var(--ink-soft)]/50">
                    <p>No active announcements.</p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-xl bg-[var(--paper-dim)] border-l-[3px] border-l-[var(--turmeric)] rounded-r-xl hover:bg-[var(--paper-dim)]/70 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-display text-[var(--ink)] text-base md:text-lg">
                          {ann.title}
                        </h3>
                        {ann.createdAt && (
                          <span className="text-[10px] uppercase font-semibold text-[var(--ink-soft)]/60 flex items-center gap-1 bg-[var(--paper-dim)] border border-[var(--kraft-border)] px-2 py-0.5 rounded-full">
                            <Calendar size={10} />
                            {formatDate(ann.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[var(--ink-soft)] leading-relaxed whitespace-pre-wrap">
                        {ann.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
