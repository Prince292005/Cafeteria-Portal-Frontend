"use client"

import { formatDistanceToNow } from "date-fns"
import { Bell } from "lucide-react"
import { useAnnouncements } from "@/lib/mock/store"
import { SectionHeading } from "@/components/kit/section-heading"
import { Reveal } from "@/components/kit/reveal"

export function AnnouncementsSection() {
  const announcements = useAnnouncements(true)

  return (
    <section id="announcements" className="bg-secondary/50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Notice board"
          title="What's happening on campus"
          description="Festival menus, extended hours, hygiene audits — the committee posts it all here first."
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {announcements.map((a, i) => (
            <Reveal key={a.id} delay={(i % 3) * 0.08}>
              <article className="flex h-full flex-col rounded-3xl border border-espresso/10 bg-card p-6 transition-shadow hover:shadow-xl hover:shadow-espresso/5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-turmeric/20 text-terracotta">
                    <Bell className="h-5 w-5" />
                  </span>
                  <time className="text-xs font-medium text-espresso/45">
                    {formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}
                  </time>
                </div>
                <h3 className="mt-4 text-balance font-serif text-xl font-semibold leading-snug">
                  {a.title}
                </h3>
                <p className="mt-2 text-pretty text-sm leading-relaxed text-espresso/60">
                  {a.message}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
