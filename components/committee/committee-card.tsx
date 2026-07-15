import { Mail } from "lucide-react"
import type { CommitteeMember } from "@/lib/types"
import { Monogram } from "@/components/kit/monogram"
import { resolveFileUrl } from "@/lib/api"

const ROLE_LABELS: Record<CommitteeMember["role"], string> = {
  FACULTY_MENTOR: "Faculty Mentor",
  CONVENER: "Convener",
  DEPUTY_CONVENER: "Deputy Convener",
  CORE_MEMBER: "Core Member",
}

export function CommitteeCard({
  member,
  index,
  featured = false,
}: {
  member: CommitteeMember
  index: number
  featured?: boolean
}) {
  return (
    <div
      className={`group flex flex-col rounded-3xl border border-espresso/10 bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-espresso/10 ${
        featured ? "sm:p-7" : ""
      }`}
    >
      {member.photoUrl ? (
        <img
          src={resolveFileUrl(member.photoUrl)}
          alt={member.name}
          className={`rounded-full object-cover ${featured ? "h-16 w-16" : "h-14 w-14"}`}
        />
      ) : (
        <Monogram
          name={member.name}
          index={index}
          className={featured ? "h-16 w-16 text-lg" : "h-14 w-14 text-base"}
        />
      )}
      <h3 className="mt-4 font-serif text-xl font-semibold leading-tight">{member.name}</h3>
      {/* Real committee role — this is the label that matters for contact
          purposes (e.g. "Convener"), not the free-text designation, which
          was previously shown here and could read as generic/misleading. */}
      <p className="mt-0.5 text-sm font-semibold text-terracotta">
        {ROLE_LABELS[member.role] ?? member.role}
      </p>
      {member.designation && (
        <p className="mt-0.5 text-xs text-espresso/50">{member.designation}</p>
      )}
      {member.studentId && (
        <p className="mt-1 text-xs text-espresso/45">ID · {member.studentId}</p>
      )}
      <a
        href={`mailto:${member.email}`}
        className="mt-4 inline-flex items-center gap-1.5 text-sm text-espresso/60 transition-colors hover:text-espresso"
      >
        <Mail className="h-3.5 w-3.5" />
        <span className="truncate">{member.email}</span>
      </a>
    </div>
  )
}
