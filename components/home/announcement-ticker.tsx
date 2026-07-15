"use client"

import { Megaphone } from "lucide-react"
import { useAnnouncements } from "@/lib/mock/store"

export function AnnouncementTicker() {
  const announcements = useAnnouncements(true)
  if (announcements.length === 0) return null
  const items = [...announcements, ...announcements]

  return (
    <div className="relative overflow-hidden border-y border-espresso/10 bg-espresso py-3 text-background">
      <div className="flex items-center">
        <span className="z-10 flex shrink-0 items-center gap-2 bg-turmeric px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-espresso">
          <Megaphone className="h-4 w-4" />
          Latest
        </span>
        <div className="flex w-max animate-marquee items-center gap-10 pl-10">
          {items.map((a, i) => (
            <span key={i} className="flex shrink-0 items-center gap-3 text-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-turmeric" />
              <span className="font-medium">{a.title}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
