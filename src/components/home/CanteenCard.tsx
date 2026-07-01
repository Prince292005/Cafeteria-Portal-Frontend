// /src/components/home/CanteenCard.tsx
"use client";

import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Canteen } from "@/services/publicService";

interface CanteenCardProps {
  canteen: Canteen;
}

// A small set of warm, muted panel tones so cards differentiate from each
// other without needing photography — cycles by canteen id.
const PANEL_TONES = [
  { bg: "#EFE3D0", ink: "#7C2D12" },
  { bg: "#E4D9C7", ink: "#1F1812" },
  { bg: "#F0E6D8", ink: "#166534" },
  { bg: "#E9DCC4", ink: "#9A3412" },
];

const CanteenCard: React.FC<CanteenCardProps> = ({ canteen }) => {
  const tone = PANEL_TONES[Number(canteen.id) % PANEL_TONES.length];
  const initial = canteen.canteenName?.trim().charAt(0).toUpperCase() || "C";

  return (
    <Link
      href={`/canteen/${canteen.id}`}
      className="group block bg-[var(--paper)] border border-[var(--kraft-border)] rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-[var(--turmeric)]/30 hover:shadow-[0_18px_36px_-16px_rgba(26,20,16,0.22)]"
    >
      {/* Identity panel — no photography, just a confident monogram on a tonal field */}
      <div
        className="grain relative h-36 w-full flex items-center justify-center overflow-hidden"
        style={{ backgroundColor: tone.bg }}
      >
        <span
          className="font-display text-6xl select-none transition-transform duration-300 group-hover:scale-105"
          style={{ color: tone.ink, opacity: 0.85 }}
        >
          {initial}
        </span>
        <span className="absolute top-3.5 left-3.5 flex items-center gap-1.5 bg-[var(--paper)]/95 text-[var(--chalk-green)] text-xs font-semibold px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--chalk-green-bright)]" />
          Open now
        </span>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="hairline mb-4 -mt-px" />
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-display text-xl text-[var(--ink)] leading-tight">
            {canteen.canteenName}
          </h3>
          <ArrowUpRight
            size={18}
            className="shrink-0 mt-1.5 text-[var(--ink-soft)]/40 transition-all duration-200 group-hover:text-[var(--turmeric)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        </div>
        <p className="text-sm text-[var(--ink-soft)] line-clamp-2 leading-relaxed mb-3">
          {canteen.info || "Menus, hours, and ratings for this counter."}
        </p>
        <span className="text-sm font-semibold text-[var(--turmeric)] group-hover:underline underline-offset-4">
          View menu &amp; rate
        </span>
      </div>
    </Link>
  );
};

export default CanteenCard;
