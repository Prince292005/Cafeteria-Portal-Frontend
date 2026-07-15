"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight, BadgeCheck, Clock, MapPin } from "lucide-react"
import type { Canteen } from "@/lib/types"
import { Stars } from "@/components/kit/stars"
import { CanteenImage } from "@/components/kit/canteen-image"
import { cn } from "@/lib/utils"

const accentText: Record<Canteen["accent"], string> = {
  terracotta: "text-terracotta",
  turmeric: "text-espresso",
  forest: "text-forest",
  sky: "text-sky",
  crimson: "text-crimson",
  royal: "text-royal",
  slate: "text-slate",
}
const accentBg: Record<Canteen["accent"], string> = {
  terracotta: "bg-terracotta",
  turmeric: "bg-turmeric",
  forest: "bg-forest",
  sky: "bg-sky",
  crimson: "bg-crimson",
  royal: "bg-royal",
  slate: "bg-slate",
}

export function CanteenCard({ canteen, index = 0 }: { canteen: Canteen; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={`/canteens/${canteen.id}`}
        className="group flex h-full flex-col overflow-hidden rounded-3xl border border-espresso/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:border-espresso/20 hover:shadow-2xl hover:shadow-espresso/10"
      >
        <div className="relative aspect-[4/3] overflow-hidden">
          <CanteenImage
            canteen={canteen}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            letterClassName="text-7xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/50 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold text-background", accentBg[canteen.accent])}>
              {canteen.cuisine}
            </span>
            {canteen.fssaiVerified && (
              <span className="flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold text-forest">
                <BadgeCheck className="h-3.5 w-3.5" /> FSSAI
              </span>
            )}
          </div>
          <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-espresso opacity-0 transition-all duration-300 group-hover:opacity-100">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-serif text-xl font-semibold leading-tight">{canteen.canteenName}</h3>
            <span className={cn("shrink-0 text-sm font-bold", accentText[canteen.accent])}>
              {"₹".repeat(canteen.priceLevel)}
              <span className="text-espresso/25">{"₹".repeat(3 - canteen.priceLevel)}</span>
            </span>
          </div>
          <p className="mt-1 text-pretty text-sm leading-relaxed text-espresso/60">{canteen.tagline}</p>

          <div className="mt-4 flex items-center gap-2">
            <Stars value={canteen.rating} size={15} />
            <span className="text-sm font-semibold">{canteen.rating.toFixed(1)}</span>
            <span className="text-xs text-espresso/45">({canteen.ratingCount.toLocaleString()})</span>
          </div>

          <div className="mt-auto space-y-1.5 pt-4 text-xs text-espresso/55">
            <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {canteen.location || "On campus"}</p>
            {canteen.hours && canteen.hours !== "—" && (
              <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {canteen.hours}</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
