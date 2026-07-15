"use client"

import { useState, useRef } from "react"
import { Mail, Pencil, Plus, Trash2, Camera, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { CommitteeMember, CommitteeRole } from "@/lib/types"
import {
  addCommitteeMember,
  deleteCommitteeMember,
  updateCommitteeMember,
  uploadCommitteePhoto,
  useCommittee,
} from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { Modal, fieldClass } from "@/components/kit/modal"
import { Monogram } from "@/components/kit/monogram"
import { resolveFileUrl } from "@/lib/api"

const ROLE_LABELS: Record<CommitteeRole, string> = {
  FACULTY_MENTOR: "Faculty Mentor",
  CONVENER: "Convener",
  DEPUTY_CONVENER: "Deputy Convener",
  CORE_MEMBER: "Core Member",
}

type Draft = Omit<CommitteeMember, "id">

const ROLES: { value: CommitteeRole; label: string }[] = [
  { value: "FACULTY_MENTOR", label: "Faculty Mentor" },
  { value: "CONVENER", label: "Convener" },
  { value: "DEPUTY_CONVENER", label: "Deputy Convener" },
  { value: "CORE_MEMBER", label: "Core Member" },
]

const EMPTY: Draft = {
  name: "",
  email: "",
  designation: "",
  role: "CORE_MEMBER",
  studentId: "",
}

export function AdminCommittee() {
  const members = useCommittee()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const activeMember = editId ? members.find((m) => m.id === editId) : null

  const openNew = () => {
    setEditId(null)
    setDraft(EMPTY)
    setOpen(true)
  }
  const openEdit = (m: CommitteeMember) => {
    setEditId(m.id)
    const { id, ...rest } = m
    setDraft({ ...rest, studentId: rest.studentId ?? "" })
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.name.trim() || !draft.email.trim()) return toast.error("Name and email are required.")
    setSaving(true)
    try {
      if (editId) {
        await updateCommitteeMember(editId, draft)
        toast.success("Member updated.")
        setOpen(false)
      } else {
        const newId = await addCommitteeMember(draft)
        toast.success("Member added — you can add their photo below.")
        if (newId) setEditId(newId)
        else setOpen(false)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save member.")
    } finally {
      setSaving(false)
    }
  }

  const handlePhoto = async (file: File | null) => {
    if (!file || !editId) return
    setUploadingPhoto(true)
    try {
      await uploadCommitteePhoto(editId, file)
      toast.success("Photo uploaded.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  return (
    <div>
      <AdminHeader
        title="Committee"
        description="Manage the food committee roster."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            <Plus className="h-4 w-4" /> Add member
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((m, i) => (
          <div key={m.id} className="rounded-3xl border border-espresso/10 bg-card p-5">
            <div className="flex items-start justify-between">
              <Monogram name={m.name} index={i} className="h-12 w-12" />
              <div className="flex gap-1">
                <button onClick={() => openEdit(m)} className="flex h-8 w-8 items-center justify-center rounded-full text-espresso/50 transition-colors hover:bg-espresso/8 hover:text-espresso" aria-label="Edit">
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm(`Remove ${m.name} from the committee? This can't be undone.`)) return
                    try {
                      await deleteCommitteeMember(m.id)
                      toast.success("Member removed.")
                    } catch (err) {
                      console.error("Failed to delete committee member", err)
                      toast.error(err instanceof Error ? err.message : "Couldn't remove member.")
                    }
                  }}
                  className="flex h-8 w-8 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/8"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <h3 className="mt-3 font-serif text-lg font-semibold">{m.name}</h3>
            <p className="text-sm font-semibold text-terracotta">{ROLE_LABELS[m.role] ?? m.role}</p>
            {m.designation && <p className="text-xs text-espresso/45">{m.designation}</p>}
            <a href={`mailto:${m.email}`} className="mt-2 inline-flex items-center gap-1.5 text-sm text-espresso/55 hover:text-espresso">
              <Mail className="h-3.5 w-3.5" /> <span className="truncate">{m.email}</span>
            </a>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit member" : "Add member"}>
        <form onSubmit={save} className="space-y-4">
          <Labeled label="Full name">
            <input className={fieldClass()} value={draft.name} onChange={(e) => set("name", e.target.value)} />
          </Labeled>
          <Labeled label="Email">
            <input type="email" className={fieldClass()} value={draft.email} onChange={(e) => set("email", e.target.value)} />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Designation">
              <input className={fieldClass()} value={draft.designation} onChange={(e) => set("designation", e.target.value)} />
            </Labeled>
            <Labeled label="Role">
              <select className={fieldClass()} value={draft.role} onChange={(e) => set("role", e.target.value as CommitteeRole)}>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </Labeled>
          </div>
          <Labeled label="Student ID (optional)">
            <input className={fieldClass()} value={draft.studentId ?? ""} onChange={(e) => set("studentId", e.target.value)} />
          </Labeled>
          {editId && (
            <div className="rounded-2xl border border-espresso/10 bg-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">Photo</p>
              {activeMember?.photoUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={resolveFileUrl(activeMember.photoUrl)}
                    alt={activeMember.name}
                    className="h-14 w-14 rounded-full border border-espresso/10 object-cover"
                  />
                  <p className="text-xs text-espresso/50">Current photo — upload a new one to replace it.</p>
                </div>
              )}
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={uploadingPhoto}
                className="mt-3 inline-flex items-center gap-2 rounded-full border border-dashed border-espresso/20 bg-background px-4 py-2 text-xs font-medium transition-colors hover:border-terracotta/50 disabled:opacity-60"
              >
                {uploadingPhoto ? <Loader2 className="h-3.5 w-3.5 animate-spin text-terracotta" /> : <Camera className="h-3.5 w-3.5" />}
                {uploadingPhoto ? "Uploading..." : activeMember?.photoUrl ? "Replace photo" : "Upload photo"}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handlePhoto(e.target.files?.[0] ?? null)}
              />
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold">{editId ? "Done" : "Cancel"}</button>
            <button type="submit" disabled={saving} className="rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-60">{saving ? "Saving..." : editId ? "Save" : "Add"}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso/50">{label}</span>
      {children}
    </label>
  )
}
