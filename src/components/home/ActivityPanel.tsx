// /src/components/home/ActivityPanel.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Flame, Star, LogIn } from "lucide-react";
import { useUser } from "@/contexts/authContext";
import { getMyEngagement, EngagementResult } from "@/services/feedbackService";

const ActivityPanel: React.FC = () => {
  const { isAuthenticated } = useUser();
  const [engagement, setEngagement] = useState<EngagementResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    getMyEngagement()
      .then(setEngagement)
      .catch(() => setEngagement(null))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="card bg-[var(--espresso)] text-[var(--paper)] border border-[var(--kraft-border-dark)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.4)]">
        <div className="card-body">
          <h2 className="font-display text-xl mb-1.5">Your activity</h2>
          <p className="text-sm text-[var(--paper)]/60 mb-4">
            Sign in to start a feedback streak and track your contributions.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--turmeric)] hover:underline underline-offset-4 w-fit"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-[var(--espresso)] text-[var(--paper)] border border-[var(--kraft-border-dark)] rounded-2xl shadow-[0_18px_40px_-24px_rgba(26,20,16,0.4)]">
      <div className="card-body">
        <h2 className="font-display text-xl mb-4">Your activity</h2>

        {loading ? (
          <div className="h-16 rounded-xl bg-white/5 animate-pulse" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-[var(--turmeric)] mb-1">
                <Flame className="w-4 h-4" />
                <span className="text-2xl font-display">
                  {engagement?.currentStreak ?? 0}
                </span>
              </div>
              <p className="text-xs text-[var(--paper)]/55">day streak</p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 p-4">
              <div className="flex items-center gap-1.5 text-[var(--chalk-green-bright)] mb-1">
                <Star className="w-4 h-4" />
                <span className="text-2xl font-display">
                  {engagement?.totalPoints ?? 0}
                </span>
              </div>
              <p className="text-xs text-[var(--paper)]/55">points earned</p>
            </div>
          </div>
        )}

        <p className="text-xs text-[var(--paper)]/45 mt-4 leading-relaxed">
          Rate any canteen once a day to keep your streak alive — points add
          up the more consistently you check in.
        </p>
      </div>
    </div>
  );
};

export default ActivityPanel;
