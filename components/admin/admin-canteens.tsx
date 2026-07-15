"use client"

import { useState, useRef } from "react"
import { Pencil, Plus, Trash2, ImagePlus, FileText, UploadCloud, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { Canteen } from "@/lib/types"
import {
  addCanteen,
  deleteCanteen,
  updateCanteen,
  uploadCanteenImage,
  uploadCanteenFssai,
  uploadCanteenMenu,
  useCanteens,
} from "@/lib/mock/store"
import { AdminHeader } from "./admin-header"
import { Modal, fieldClass } from "@/components/kit/modal"
import { Stars } from "@/components/kit/stars"
import { CanteenImage } from "@/components/kit/canteen-image"
import { resolveFileUrl } from "@/lib/api"

type Draft = Omit<Canteen, "id">

const EMPTY: Draft = {
  canteenName: "",
  tagline: "",
  info: "",
  cuisine: "",
  location: "",
  hours: "",
  priceLevel: 2,
  rating: 4,
  ratingCount: 0,
  fssaiVerified: false,
  fssaiCertificateUrl: "",
  imageUrl: "",
  menuFilePath: "",
  accent: "terracotta",
  menu: [],
}

export function AdminCanteens() {
  const canteens = useCanteens()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState<"image" | "fssai" | "menu" | null>(null)

  const imageInputRef = useRef<HTMLInputElement>(null)
  const fssaiInputRef = useRef<HTMLInputElement>(null)
  const menuInputRef = useRef<HTMLInputElement>(null)

  // The id files get uploaded against — the canteen being edited, or the one
  // just created in this modal session (before the modal is closed).
  const activeId = editId
  const activeCanteen = activeId ? canteens.find((c) => c.id === activeId) : null

  const openNew = () => {
    setEditId(null)
    setDraft(EMPTY)
    setOpen(true)
  }
  const openEdit = (c: Canteen) => {
    setEditId(c.id)
    const { id, ...rest } = c
    setDraft(rest)
    setOpen(true)
  }

  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!draft.canteenName.trim()) return toast.error("Name is required.")
    setSaving(true)
    try {
      if (editId) {
        await updateCanteen(editId, draft)
        toast.success("Canteen updated.")
        setOpen(false)
      } else {
        const newId = await addCanteen(draft)
        toast.success("Canteen added — you can now upload a photo, FSSAI certificate, and menu below.")
        // Switch straight into edit mode for the new canteen so the upload
        // section becomes available without the admin re-opening the modal.
        setEditId(newId)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save canteen.")
    } finally {
      setSaving(false)
    }
  }

  const remove = async (c: Canteen) => {
    if (!window.confirm(`Remove ${c.canteenName}? This can't be undone.`)) return
    try {
      await deleteCanteen(c.id)
      toast.success(`${c.canteenName} removed.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't remove canteen.")
    }
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }))

  const handleUpload = async (kind: "image" | "fssai" | "menu", file: File | null) => {
    if (!file || !activeId) return
    setUploading(kind)
    try {
      if (kind === "image") await uploadCanteenImage(activeId, file)
      if (kind === "fssai") await uploadCanteenFssai(activeId, file)
      if (kind === "menu") await uploadCanteenMenu(activeId, file)
      toast.success(
        kind === "image" ? "Photo uploaded." : kind === "fssai" ? "FSSAI certificate uploaded." : "Menu uploaded.",
      )
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.")
    } finally {
      setUploading(null)
    }
  }

  return (
    <div>
      <AdminHeader
        title="Canteens"
        description="Add, edit, and manage every canteen on campus."
        action={
          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            <Plus className="h-4 w-4" /> Add canteen
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {canteens.map((c) => (
          <div key={c.id} className="overflow-hidden rounded-3xl border border-espresso/10 bg-card">
            <div className="relative aspect-[16/10]">
              <CanteenImage canteen={c} fill sizes="33vw" className="object-cover" letterClassName="text-5xl" />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-serif text-lg font-semibold">{c.canteenName}</h3>
                <span className="text-xs font-semibold text-terracotta">{"₹".repeat(c.priceLevel)}</span>
              </div>
              <p className="mt-1 text-sm text-espresso/55">{c.cuisine} · {c.location}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <Stars value={c.rating} size={14} />
                <span className="text-xs text-espresso/50">{c.rating.toFixed(1)} ({c.ratingCount})</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => openEdit(c)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-espresso/15 py-2 text-xs font-semibold transition-colors hover:border-terracotta/50"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
                <button
                  onClick={() => remove(c)}
                  className="inline-flex items-center justify-center rounded-full border border-destructive/25 px-3 py-2 text-destructive transition-colors hover:bg-destructive/5"
                  aria-label={`Delete ${c.canteenName}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title={editId ? "Edit canteen" : "Add canteen"}>
        <form onSubmit={save} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Name">
              <input className={fieldClass()} value={draft.canteenName} onChange={(e) => set("canteenName", e.target.value)} />
            </Labeled>
            <Labeled label="Cuisine">
              <input className={fieldClass()} value={draft.cuisine} onChange={(e) => set("cuisine", e.target.value)} />
            </Labeled>
          </div>
          <Labeled label="Tagline">
            <input className={fieldClass()} value={draft.tagline} onChange={(e) => set("tagline", e.target.value)} />
          </Labeled>
          <Labeled label="Description">
            <textarea rows={3} className={fieldClass()} value={draft.info} onChange={(e) => set("info", e.target.value)} />
          </Labeled>
          <div className="grid gap-4 sm:grid-cols-2">
            <Labeled label="Location">
              <input className={fieldClass()} value={draft.location} onChange={(e) => set("location", e.target.value)} />
            </Labeled>
            <Labeled label="Hours">
              <input className={fieldClass()} value={draft.hours} onChange={(e) => set("hours", e.target.value)} placeholder="e.g. 8:00 AM – 9:00 PM" />
            </Labeled>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <Labeled label="Price level">
              <select className={fieldClass()} value={draft.priceLevel} onChange={(e) => set("priceLevel", Number(e.target.value) as Canteen["priceLevel"])}>
                <option value={1}>₹ Budget</option>
                <option value={2}>₹₹ Moderate</option>
                <option value={3}>₹₹₹ Premium</option>
              </select>
            </Labeled>
            <Labeled label="Accent">
              <select className={fieldClass()} value={draft.accent} onChange={(e) => set("accent", e.target.value as Canteen["accent"])}>
                <option value="terracotta">Terracotta — Indian food, cafés</option>
                <option value="turmeric">Turmeric — Snacks, breakfast</option>
                <option value="forest">Forest — Healthy / Jain food</option>
                <option value="sky">Sky — Dairy, beverages</option>
                <option value="crimson">Crimson — Non-veg, BBQ, spicy</option>
                <option value="royal">Royal — Premium café, desserts</option>
                <option value="slate">Slate — Modern outlets, fast food</option>
              </select>
            </Labeled>
            <Labeled label="FSSAI">
              <select className={fieldClass()} value={draft.fssaiVerified ? "yes" : "no"} onChange={(e) => set("fssaiVerified", e.target.value === "yes")}>
                <option value="yes">Verified</option>
                <option value="no">Not verified</option>
              </select>
            </Labeled>
          </div>

          {activeId && (
            <div className="rounded-2xl border border-espresso/10 bg-cream/40 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-espresso/50">Photo &amp; documents</p>

              {activeCanteen?.imageUrl && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={resolveFileUrl(activeCanteen.imageUrl)}
                    alt={`${activeCanteen.canteenName} photo`}
                    className="h-16 w-16 rounded-xl border border-espresso/10 object-cover"
                  />
                  <p className="text-xs text-espresso/50">Current photo — upload a new one below to replace it.</p>
                </div>
              )}

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <UploadSlot
                  label="Canteen photo"
                  icon={<ImagePlus className="h-4 w-4" />}
                  hasFile={!!activeCanteen?.imageUrl}
                  busy={uploading === "image"}
                  onPick={() => imageInputRef.current?.click()}
                />
                <UploadSlot
                  label="FSSAI certificate"
                  icon={<FileText className="h-4 w-4" />}
                  hasFile={!!activeCanteen?.fssaiCertificateUrl}
                  busy={uploading === "fssai"}
                  onPick={() => fssaiInputRef.current?.click()}
                />
                <UploadSlot
                  label="Menu file"
                  icon={<UploadCloud className="h-4 w-4" />}
                  hasFile={!!activeCanteen?.menuFilePath}
                  busy={uploading === "menu"}
                  onPick={() => menuInputRef.current?.click()}
                />
              </div>
              {activeCanteen?.fssaiCertificateUrl && (
                <a
                  href={resolveFileUrl(activeCanteen.fssaiCertificateUrl)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-xs text-forest underline underline-offset-2"
                >
                  View current FSSAI certificate
                </a>
              )}
              {activeCanteen?.menuFilePath && (
                <a
                  href={resolveFileUrl(activeCanteen.menuFilePath)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 ml-4 inline-block text-xs text-terracotta underline underline-offset-2"
                >
                  View current menu
                </a>
              )}
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload("image", e.target.files?.[0] ?? null)}
              />
              <input
                ref={fssaiInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleUpload("fssai", e.target.files?.[0] ?? null)}
              />
              <input
                ref={menuInputRef}
                type="file"
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => handleUpload("menu", e.target.files?.[0] ?? null)}
              />
            </div>
          )}
          {!activeId && (
            <p className="text-xs text-espresso/50">
              Save the canteen first, then you can upload its photo, FSSAI certificate, and menu here.
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setOpen(false)} className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold">
              {activeId ? "Done" : "Cancel"}
            </button>
            <button type="submit" disabled={saving} className="rounded-full bg-espresso px-6 py-2.5 text-sm font-semibold text-background disabled:opacity-60">
              {saving ? "Saving..." : editId ? "Save changes" : "Add canteen"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function UploadSlot({
  label,
  icon,
  hasFile,
  busy,
  onPick,
}: {
  label: string
  icon: React.ReactNode
  hasFile: boolean
  busy: boolean
  onPick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onPick}
      disabled={busy}
      className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-espresso/20 bg-background px-3 py-4 text-center transition-colors hover:border-terracotta/50 disabled:opacity-60"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-terracotta" /> : icon}
      <span className="text-xs font-medium">{label}</span>
      <span className="text-[11px] text-espresso/45">{busy ? "Uploading..." : hasFile ? "Replace" : "Upload"}</span>
    </button>
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
