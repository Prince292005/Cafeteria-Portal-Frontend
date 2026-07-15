"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { useCommittee } from "@/lib/mock/store"
import { CommitteeCard } from "@/components/committee/committee-card"
import { SectionHeading } from "@/components/kit/section-heading"
import { Reveal } from "@/components/kit/reveal"

export function CommitteePreview() {
  const committee = useCommittee()
  const leaders = committee.filter((m) => m.role !== "CORE_MEMBER")

  return (
    <section id="committee" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <SectionHeading
          eyebrow="Who runs this"
          title={<>The people keeping<br />dining honest.</>}
          description="A student-and-faculty food committee reviews complaints, audits hygiene, and acts on your feedback every single week."
        />
        <Link
          href="/committee"
          className="group inline-flex shrink-0 items-center gap-2 rounded-full border border-espresso/20 px-5 py-3 text-sm font-semibold transition-colors hover:bg-espresso/5"
        >
          Meet the whole team
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {leaders.map((m, i) => (
          <Reveal key={m.id} delay={i * 0.08}>
            <CommitteeCard member={m} index={i} featured />
          </Reveal>
        ))}
      </div>
    </section>
  )
}
