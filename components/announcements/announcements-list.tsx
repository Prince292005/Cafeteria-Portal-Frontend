"use client"

import { format } from "date-fns"
import { Megaphone } from "lucide-react"
import { useAnnouncements } from "@/lib/mock/store"
import { Reveal } from "@/components/kit/reveal"

export function AnnouncementsList() {
  const announcements = useAnnouncements(true)

  if (announcements.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-espresso/20 p-12 text-center text-sm text-espresso/55">
        No announcements right now. Check back soon.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {announcements.map((a, i) => (
        <Reveal key={a.id} delay={i * 0.05}>
          <article className="flex gap-4 rounded-3xl border border-espresso/10 bg-card p-6 transition-colors hover:border-terracotta/30">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-turmeric/20 text-espresso">
              <Megaphone className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-serif text-xl font-semibold">{a.title}</h3>
                <span className="text-xs text-espresso/45">{format(new Date(a.createdAt), "d MMM yyyy")}</span>
              </div>
              <p className="mt-1.5 text-pretty leading-relaxed text-espresso/65">{a.message}</p>
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  )
}
