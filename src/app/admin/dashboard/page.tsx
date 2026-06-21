"use client";

import { useUser } from "@/contexts/authContext";
import Link from "next/link";
import {
  Store,
  UtensilsCrossed,
  Megaphone,
  MessageSquareWarning,
  MessageCircle,
  LayoutDashboard,
  FileText,
  Users, // New icon for Reports
} from "lucide-react";

export default function AdminDashboardPage() {
  const { user } = useUser();

  const adminModules = [
    {
      title: "Manage Canteens",
      description:
        "Add new canteens, edit details, or updatte existing canteen information.",
      icon: Store,
      href: "/admin/canteens",
      btnText: "Go to Canteens",
      color: "text-blue-500",
    },
    {
      title: "Committee Members",
      description: "Manage student core members and faculty mentors.",
      icon: Users,
      href: "/admin/committee",
      btnText: "Manage Team",
      color: "text-green-500",
    },
    {
      title: "Announcements",
      description:
        "Broadcast notifications regarding holidays or special offers.",
      icon: Megaphone,
      href: "/admin/announcements",
      btnText: "Post Announcement",
      color: "text-orange-500",
    },
    {
      title: "Manage Complaints",
      description: "Review, track, and resolve student complaints efficiently.",
      icon: MessageSquareWarning,
      href: "/admin/complaints",
      btnText: "View Complaints",
      color: "text-red-500",
    },
    {
      title: "User Feedback",
      description:
        "Analyze ratings and suggestions to improve canteen services.",
      icon: MessageCircle,
      href: "/admin/feedback",
      btnText: "Check Feedback",
      color: "text-purple-500",
    },
    // --- NEW SECTION ADDED HERE ---
    {
      title: "Monthly Reports",
      description:
        "Generate AI-powered monthly reports for canteen performance.",
      icon: FileText,
      href: "/admin/reports",
      btnText: "View Reports",
      color: "text-teal-500",
    },
  ];

  return (
    <div className="container mx-auto p-4 md:p-8 min-h-screen bg-base-200/30">
      <div className="text-center mb-12 mt-4">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-base-100 rounded-full shadow-sm">
            <LayoutDashboard className="w-10 h-10 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-3">Admin Dashboard</h1>
        <p className="text-lg text-base-content/70">
          Welcome back,{" "}
          <span className="font-semibold text-primary">
            {user?.studentId || "Administrator"}
          </span>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {adminModules.map((module, index) => (
          <div
            key={index}
            className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-base-200"
          >
            <div className="card-body">
              <div className="flex items-center gap-4 mb-2">
                <div className={`p-3 rounded-xl bg-base-200 ${module.color}`}>
                  <module.icon className="w-6 h-6" />
                </div>
                <h2 className="card-title text-xl">{module.title}</h2>
              </div>

              <p className="text-base-content/70 mb-4 h-12">
                {module.description}
              </p>

              <div className="card-actions justify-end mt-auto">
                <Link
                  href={module.href}
                  className="btn btn-primary w-full rounded-lg sm:w-auto"
                >
                  {module.btnText}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
