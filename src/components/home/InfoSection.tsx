"use client";

import React, { useEffect, useState } from "react";
import {
  Clock,
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
  const [currentHour, setCurrentHour] = useState(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [committee, setCommittee] = useState<CommitteeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const now = new Date();
    setCurrentHour(now.getHours() + now.getMinutes() / 60);

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

  const isActive = (start: number, end: number) => {
    return currentHour >= start && currentHour < end;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getRowClass = (start: number, end: number) => {
    return isActive(start, end)
      ? "bg-primary/10 text-primary-focus font-medium"
      : "";
  };

  const getImgUrl = (path?: string) => {
    if (!path) return null;
    return path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  };

  return (
    <section className="pt-12 pb-16 bg-base-100">
      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: Committee Members */}
        <div className="lg:col-span-1">
          <div className="card bg-white shadow-lg sticky top-24 border border-base-200 max-h-[600px] overflow-hidden flex flex-col">
            <div className="card-body p-6 flex flex-col h-full">
              <h2 className="card-title text-2xl flex gap-2 mb-4">
                <Users className="text-primary" />
                CMC Team
              </h2>

              <div className="overflow-y-auto pr-2 custom-scrollbar space-y-6 flex-1">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-primary/30" />
                  </div>
                ) : !committee ? (
                  <p className="text-sm text-gray-400 text-center py-4">
                    Committee info unavailable.
                  </p>
                ) : (
                  <>
                    {/* 1. Faculty Mentor */}
                    {committee.facultyMentor && (
                      <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" /> Mentor
                        </h3>
                        <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-xl border border-purple-100">
                          <div className="avatar">
                            <div className="w-12 h-12 rounded-full ring ring-purple-200 ring-offset-base-100 ring-offset-1">
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
                            <p className="font-bold text-sm text-gray-800 truncate">
                              {committee.facultyMentor.name}
                            </p>
                            <p className="text-xs text-purple-600 font-medium mb-1">
                              Faculty In-Charge
                            </p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 truncate">
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
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                          <Award className="w-3 h-3" /> Leads
                        </h3>
                        <div className="space-y-3">
                          {committee.convener && (
                            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-50 transition-colors">
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
                                  <p className="font-semibold text-sm text-gray-800 truncate">
                                    {committee.convener.name}
                                  </p>
                                  <span className="badge badge-xs badge-primary badge-outline">
                                    Convener
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span className="truncate">
                                    {committee.convener.email}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                          {committee.deputyConvener && (
                            <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-base-50 transition-colors">
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
                                  <p className="font-semibold text-sm text-gray-800 truncate">
                                    {committee.deputyConvener.name}
                                  </p>
                                  <span className="badge badge-xs badge-secondary badge-outline">
                                    Deputy
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 truncate">
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
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1">
                            <User className="w-3 h-3" /> Core Members
                          </h3>
                          <div className="grid grid-cols-1 gap-2">
                            {committee.coreMembers.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
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
                                    <p className="text-xs font-bold text-gray-700 truncate">
                                      {member.name}
                                    </p>
                                    <span className="text-[10px] text-gray-400 truncate ml-2 max-w-[80px] text-right">
                                      {member.designation}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-gray-500 truncate">
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

        {/* CENTER: Operating Hours */}
        <div className="lg:col-span-1 space-y-8">
          <div className="card bg-white shadow-lg border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-2xl flex gap-2">
                <Clock className="text-primary" />
                Operating Hours
              </h2>
              <div className="overflow-x-auto mt-4">
                <table className="table border-separate border-spacing-y-1">
                  <tbody>
                    {/* Breakfast */}
                    <tr className={getRowClass(7.5, 10)}>
                      <th
                        className={`font-semibold ${
                          isActive(7.5, 10) ? "rounded-l-lg" : ""
                        }`}
                      >
                        Breakfast:
                      </th>
                      <td className={isActive(7.5, 10) ? "rounded-r-lg" : ""}>
                        7:30 AM - 10:00 AM
                      </td>
                    </tr>

                    {/* Lunch */}
                    <tr className={getRowClass(12, 14.5)}>
                      <th
                        className={`font-semibold ${
                          isActive(12, 14.5) ? "rounded-l-lg" : ""
                        }`}
                      >
                        Lunch:
                      </th>
                      <td className={isActive(12, 14.5) ? "rounded-r-lg" : ""}>
                        12:00 PM - 2:30 PM
                      </td>
                    </tr>

                    {/* Snacks */}
                    <tr className={getRowClass(16, 18)}>
                      <th
                        className={`font-semibold ${
                          isActive(16, 18) ? "rounded-l-lg" : ""
                        }`}
                      >
                        Snacks:
                      </th>
                      <td className={isActive(16, 18) ? "rounded-r-lg" : ""}>
                        4:00 PM - 6:00 PM
                      </td>
                    </tr>

                    {/* Dinner */}
                    <tr className={getRowClass(19.5, 21.5)}>
                      <th
                        className={`font-semibold ${
                          isActive(19.5, 21.5) ? "rounded-l-lg" : ""
                        }`}
                      >
                        Dinner:
                      </th>
                      <td
                        className={isActive(19.5, 21.5) ? "rounded-r-lg" : ""}
                      >
                        7:30 PM - 9:30 PM
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Announcements */}
        <div className="lg:col-span-1">
          <div className="card bg-white shadow-lg sticky top-24 border border-base-200">
            <div className="card-body">
              <h2 className="card-title text-2xl flex gap-2">
                <Megaphone className="text-primary" />
                Announcements
              </h2>

              <div className="space-y-4 mt-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
                  </div>
                ) : announcements.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <p>No active announcements.</p>
                  </div>
                ) : (
                  announcements.map((ann) => (
                    <div
                      key={ann.id}
                      className="p-4 rounded-xl bg-base-100 border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-gray-800 text-sm md:text-base">
                          {ann.title}
                        </h3>
                        {ann.createdAt && (
                          <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1 bg-gray-100 px-2 py-0.5 rounded-full">
                            <Calendar size={10} />
                            {formatDate(ann.createdAt)}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
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
