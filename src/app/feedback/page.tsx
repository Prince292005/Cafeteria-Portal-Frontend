import React from "react";
import FeedbackForm from "@/components/feedback/FeedbackForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Feedback | Cafeteria Portal",
  description: "Share your dining experience with us.",
};

export default function FeedbackPage() {
  return (
    <div className="min-h-screen bg-[var(--paper-dim)]">
      <div className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold text-[var(--turmeric)] mb-2">
            Share your experience
          </p>
          <h1 className="font-display text-4xl text-[var(--ink)] mb-3">
            Canteen feedback
          </h1>
          <p className="text-[var(--ink-soft)] leading-relaxed">
            Select a canteen and rate each category. Your responses go directly
            to the CMC&apos;s monthly report.
          </p>
        </div>

        <div className="bg-[var(--paper)] border border-[var(--kraft-border)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.14)] overflow-hidden">
          <div className="p-6 md:p-8">
            <FeedbackForm />
          </div>
        </div>

        <p className="text-center text-xs text-[var(--ink-soft)]/40 mt-10">
          © {new Date().getFullYear()} DAU Cafeteria Portal · Built by students, for students.
        </p>
      </div>
    </div>
  );
}
