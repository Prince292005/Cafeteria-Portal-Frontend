// src/components/home/HeroSection.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquarePlus, Star } from "lucide-react";

interface MealPeriod {
  label: string;
  start: number;
  end: number;
  time: string;
}

const MEAL_PERIODS: MealPeriod[] = [
  { label: "Breakfast", start: 7.5, end: 10, time: "7:30 – 10:00 AM" },
  { label: "Lunch", start: 12, end: 14.5, time: "12:00 – 2:30 PM" },
  { label: "Snacks", start: 16, end: 18, time: "4:00 – 6:00 PM" },
  { label: "Dinner", start: 19.5, end: 21.5, time: "7:30 – 9:30 PM" },
];

const HeroSection: React.FC = () => {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const interval = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Campus is always IST, regardless of the visitor's device timezone.
  // Using Intl here instead of getHours()/getMinutes() avoids the bug where
  // a visitor with a non-IST system clock would see the wrong meal highlighted.
  const istParts = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        hour: "numeric",
        minute: "numeric",
        hourCycle: "h23",
      }).formatToParts(now)
    : null;

  const istHour = istParts
    ? Number(istParts.find((p) => p.type === "hour")?.value ?? 0)
    : null;
  const istMinute = istParts
    ? Number(istParts.find((p) => p.type === "minute")?.value ?? 0)
    : null;

  const currentHour =
    istHour !== null && istMinute !== null ? istHour + istMinute / 60 : null;
  const activePeriod =
    currentHour !== null
      ? MEAL_PERIODS.find((m) => currentHour >= m.start && currentHour < m.end)
      : null;

  const dateLabel = now
    ? new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Kolkata",
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(now)
    : "";

  return (
    <section className="grain relative bg-[var(--espresso)] text-[var(--paper)] overflow-hidden">
      {/* Ambient warmth — a quiet radial wash behind the thesis, not a spotlight */}
      <div
        className="pointer-events-none absolute -top-32 -left-24 w-[34rem] h-[34rem] rounded-full opacity-[0.16] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--turmeric) 0%, transparent 70%)" }}
      />

      <div className="container relative mx-auto px-4 pt-14 pb-16 md:pt-20 md:pb-24">
        {/* Eyebrow: today's date, live */}
        <div className="flex items-center gap-3 mb-8 text-sm font-medium text-[var(--paper)]/55">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--chalk-green-bright)] animate-pulse" />
          {dateLabel || "Cafeteria Management Committee"}
        </div>

        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 items-start">
          {/* Left: thesis */}
          <div className="lg:col-span-3">
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.85rem] leading-[1.06] mb-7">
              Your meal,
              <br />
              <em className="not-italic text-[var(--turmeric)]">your say.</em>
            </h1>
            <p className="text-base md:text-lg text-[var(--paper)]/70 max-w-md leading-relaxed mb-10">
              A faster way to tell the Cafeteria Management Committee what’s working, and a clear way to see what happens next.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5">
              <Link
                href="/complaints"
                className="btn-tactile inline-flex items-center justify-center gap-2 bg-[var(--turmeric)] text-[var(--paper)] font-semibold px-6 py-3.5 rounded-lg shadow-[0_10px_30px_-12px_rgba(194,65,12,0.65)] hover:bg-[var(--turmeric-deep)] hover:-translate-y-px transition-all duration-200"
              >
                <MessageSquarePlus size={18} />
                File a complaint
              </Link>
              <Link
                href="#canteens"
                className="btn-tactile inline-flex items-center justify-center gap-2 border border-[var(--paper)]/25 text-[var(--paper)] font-semibold px-6 py-3.5 rounded-lg hover:bg-[var(--paper)]/10 hover:border-[var(--paper)]/40 transition-all duration-200"
              >
                <Star size={18} />
                Rate a canteen
              </Link>
            </div>
          </div>

          {/* Right: the menu board — today's meal periods, live */}
          <div className="lg:col-span-2">
            <div className="border border-[var(--paper)]/15 rounded-xl overflow-hidden bg-[var(--espresso-card)] shadow-[0_24px_48px_-24px_rgba(0,0,0,0.5)]">
              <div className="px-5 py-3.5 border-b border-[var(--paper)]/15 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--paper)]/60">
                  Today’s service
                </span>
                <span className="text-sm font-semibold text-[var(--chalk-green-bright)]">
                  12 counters open
                </span>
              </div>
              <ul>
                {MEAL_PERIODS.map((meal) => {
                  const isOpen = activePeriod?.label === meal.label;
                  return (
                    <li
                      key={meal.label}
                      className={`px-5 py-4 flex items-center justify-between border-b border-[var(--paper)]/10 last:border-b-0 transition-colors ${
                        isOpen ? "bg-[var(--turmeric)]/10" : ""
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-1 self-stretch rounded-full ${
                            isOpen ? "bg-[var(--turmeric)]" : "bg-transparent"
                          }`}
                        />
                        <div>
                          <p
                            className={`font-semibold ${
                              isOpen
                                ? "text-[var(--turmeric)]"
                                : "text-[var(--paper)]/90"
                            }`}
                          >
                            {meal.label}
                          </p>
                          <p className="text-sm text-[var(--paper)]/45 mt-0.5">
                            {meal.time}
                          </p>
                        </div>
                      </div>
                      {isOpen && (
                        <span className="text-xs font-semibold bg-[var(--chalk-green)] text-[var(--paper)] px-2.5 py-1 rounded-full">
                          Serving now
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
