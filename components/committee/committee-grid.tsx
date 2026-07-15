"use client"

import { useCommittee } from "@/lib/mock/store"
import { CommitteeCard } from "./committee-card"
import { Reveal } from "@/components/kit/reveal"

const roleOrder = ["FACULTY_MENTOR", "CONVENER", "DEPUTY_CONVENER", "CORE_MEMBER"]

export function CommitteeGrid() {
  const members = useCommittee()
  const leads = members
    .filter((m) => m.role !== "CORE_MEMBER")
    .sort((a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role))
  const core = members.filter((m) => m.role === "CORE_MEMBER")

  return (
    <div className="space-y-14">
      <div>
        <Reveal>
          <h2 className="font-serif text-2xl font-semibold">Leadership</h2>
        </Reveal>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.05}>
              <CommitteeCard member={m} index={i} featured />
            </Reveal>
          ))}
        </div>
      </div>

      {core.length > 0 && (
        <div>
          <Reveal>
            <h2 className="font-serif text-2xl font-semibold">Core members</h2>
          </Reveal>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {core.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.04}>
                <CommitteeCard member={m} index={i + leads.length} />
              </Reveal>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
