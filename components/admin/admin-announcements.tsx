"use client"

import { useState } from "react"
import { format } from "date-fns"
import { Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"
import {
  createAnnouncement,
  deleteAnnouncement,
  toggleAnnouncement,
  useAnnouncements,
} from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { Modal, fieldClass } from "@/components/kit/modal"
import { cn } from "@/lib/utils"

export function AdminAnnouncements() {
  const announcements = useAnnouncements()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (title.trim().length < 3 || message.trim().length < 5)
      return toast.error("Add a title and a message.")
    try {
      await createAnnouncement(title.trim(), message.trim())
      toast.success("Announcement published.")
      setTitle("")
      setMessage("")
      setOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't publish announcement.")
    }
  }

  return (
    <div>
      <AdminHeader
        title="Announcements"
        description="Publish updates that appear on the homepage ticker and announcements page."
        action={
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            <Plus className="h-4 w-4" /> New announcement
          </button>
        }
      />

      <div className="space-y-3">
        {announcements.map((a) => (
          <div key={a.id} className="flex flex-wrap items-start justify-between gap-4 rounded-3xl border border-espresso/10 bg-card p-5">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-semibold">{a.title}</h3>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    a.isActive ? "bg-forest/15 text-forest" : "bg-espresso/8 text-espresso/50",
                  )}
                >
                  {a.isActive ? "Live" : "Hidden"}
                </span>
              </div>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-espresso/60">{a.message}</p>
              <p className="mt-1.5 text-xs text-espresso/40">{format(new Date(a.createdAt), "d MMM yyyy, h:mm a")}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={async () => {
                  if (a.isActive) {
                    try {
                      await toggleAnnouncement(a.id, false)
                      toast.success("Announcement hidden.")
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Couldn't hide announcement.")
                    }
                  } else {
                    toast.error("Republishing isn't supported yet — post a new announcement instead.")
                  }
                }}
                className="rounded-full border border-espresso/15 px-4 py-2 text-xs font-semibold transition-colors hover:border-terracotta/50"
              >
                {a.isActive ? "Hide" : "Publish"}
              </button>
              <button
                onClick={async () => {
                  try {
                    await deleteAnnouncement(a.id)
                    toast.success("Announcement deleted.")
                  } catch (err) {
                    toast.error(err instanceof Error ? err.message : "Couldn't delete announcement.")
                  }
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-destructive transition-colors hover:bg-destructive/8"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="New announcement">
        <form onSubmit={save} className="space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso/50">Title</span>
            <input className={fieldClass()} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Extended hours during exams" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-espresso/50">Message</span>
            <textarea rows={4} className={fieldClass()} value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Share the details students should know." />
          </label>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold">Cancel</button>
            <button type="submit" className="rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-background">Publish</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
