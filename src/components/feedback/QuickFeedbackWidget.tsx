"use client";

import React, { useEffect, useState } from "react";
import { Star, Flame, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import {
  submitQuickFeedback,
  getMyEngagement,
} from "@/services/feedbackService";

const TAGS = ["Hygiene", "Taste", "Staff", "Service"];

interface QuickFeedbackWidgetProps {
  canteenId: string | number;
}

export default function QuickFeedbackWidget({
  canteenId,
}: QuickFeedbackWidgetProps) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [streak, setStreak] = useState<number | null>(null);

  // Load existing streak on mount so returning students see it immediately,
  // without needing to submit again. Silently ignored if not logged in / fails.
  useEffect(() => {
    getMyEngagement()
      .then((res) => setStreak(res.currentStreak))
      .catch(() => {
        /* not logged in or no streak yet — fine, widget still works */
      });
  }, []);

  const handleRate = async (rating: number) => {
    if (submitting || submitted) return;
    setSubmitting(true);
    try {
      const result = await submitQuickFeedback(
        canteenId,
        rating,
        selectedTag ?? undefined
      );
      setStreak(result.currentStreak);
      setSubmitted(true);

      if (result.streakExtended && result.currentStreak > 1) {
        toast.success(`${result.currentStreak}-day streak! Keep it up.`);
      } else {
        toast.success("Thanks for the feedback!");
      }
    } catch (err) {
      console.error("Quick feedback failed", err);
      toast.error("Couldn't submit feedback — please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Streak badge — always rendered the same way regardless of submit state,
  // so it's visible both before and after a student rates today's meal.
  // Shows for any streak >= 1 (previously this was hidden entirely once
  // `submitted` flipped true, and a streak of exactly 1 was never shown at all).
  const streakBadge =
    streak !== null && streak > 0 ? (
      <div className="flex items-center gap-1 bg-white px-2.5 py-1 rounded-full border border-teal-100 shrink-0">
        <Flame className="w-4 h-4 text-orange-500" />
        <span className="text-sm font-semibold text-teal-900">
          {streak}
        </span>
      </div>
    ) : null;

  if (submitted) {
    return (
      <div className="card bg-teal-50 border border-teal-100 p-6 rounded-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white text-teal-600 rounded-xl shadow-sm border border-teal-100">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-teal-900">Feedback recorded</h4>
              <p className="text-sm text-teal-700/80 mt-0.5">
                {streak && streak > 1
                  ? `You're on a ${streak}-day feedback streak.`
                  : "Thanks for letting us know how it went."}
              </p>
            </div>
          </div>
          {streakBadge}
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-teal-50 border border-teal-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h4 className="font-bold text-lg text-teal-900">
            How was today&apos;s meal?
          </h4>
          <p className="text-sm text-teal-700/80 mt-0.5">
            One tap — takes 5 seconds.
          </p>
        </div>
        {streakBadge}
      </div>

      {/* Star rating */}
      <div className="flex items-center gap-1.5 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={submitting}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => handleRate(star)}
            className="transition-transform hover:scale-110 disabled:opacity-50"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-8 h-8 ${
                star <= hoverRating
                  ? "fill-amber-400 text-amber-400"
                  : "fill-none text-amber-300"
              }`}
            />
          </button>
        ))}
        {submitting && (
          <Loader2 className="w-5 h-5 text-teal-600 animate-spin ml-2" />
        )}
      </div>

      {/* Optional quick tag */}
      <div className="flex flex-wrap gap-2">
        {TAGS.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() =>
              setSelectedTag((prev) => (prev === tag ? null : tag))
            }
            className={`badge badge-sm px-3 py-3 cursor-pointer transition-colors ${
              selectedTag === tag
                ? "badge-primary"
                : "badge-outline border-teal-200 text-teal-700 hover:bg-teal-100"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
      <p className="text-xs text-teal-700/60 mt-2">
        Tag is optional — tap a star above to submit.
      </p>
    </div>
  );
}
