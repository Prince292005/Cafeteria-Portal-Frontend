"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useCanteens } from "@/lib/mock/store"
import { CanteenCard } from "@/components/canteens/canteen-card"
import { SectionHeading } from "@/components/kit/section-heading"

export function CanteensPreview() {
  const canteens = useCanteens()
  const featured = canteens.slice(0, 3)

  return (
    <section id="canteens" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Where to eat"
          title={<>Every canteen,<br />on one menu.</>}
          description="From unlimited thalis to late-night Maggi runs — find your spot, check the menu, and see what students really think."
        />
        <Link
          href="/canteens"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-espresso/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-espresso/5"
        >
          View all {canteens.length}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((c, i) => (
          <CanteenCard key={c.id} canteen={c} index={i} />
        ))}
      </div>
    </section>
  )
}
