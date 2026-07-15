"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "motion/react"
import { CheckCircle2, ImagePlus, Loader2, Lock, Send, X } from "lucide-react"
import { toast } from "sonner"
import { createComplaint, useCanteens } from "@/lib/mock/store"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

export function ComplaintForm() {
  const router = useRouter()
  const params = useSearchParams()
  const { user, loading } = useAuth()
  const canteens = useCanteens()

  const preselect = params.get("canteen")
  const [canteenId, setCanteenId] = useState<number | null>(preselect ? Number(preselect) : null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [image, setImage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl items-center justify-center rounded-3xl border border-espresso/10 bg-card p-12 text-sm text-espresso/50">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-espresso/10 bg-card p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <Lock className="h-6 w-6" />
        </span>
        <h2 className="mt-4 font-serif text-2xl font-semibold">Log in to raise a complaint</h2>
        <p className="mt-2 text-sm text-espresso/60">
          Complaints are tied to your account so the committee can follow up with you.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-flex rounded-full bg-espresso px-6 py-3 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
        >
          Log in
        </Link>
      </div>
    )
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canteenId) return toast.error("Please select a canteen.")
    if (title.trim().length < 4) return toast.error("Add a short, clear title.")
    if (description.trim().length < 10) return toast.error("Please describe the issue in a bit more detail.")
    setBusy(true)
    try {
      await createComplaint({
        canteenId,
        title: title.trim(),
        description: description.trim(),
        emailId: user.email,
        hasImage: !!image,
      })
      setDone(true)
      toast.success("Complaint submitted. The committee has been notified.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't submit complaint — please try again.")
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mx-auto max-w-md rounded-3xl border border-forest/20 bg-forest/5 p-8 text-center"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-forest-foreground">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 font-serif text-3xl font-semibold text-forest">Complaint filed</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-espresso/60">
          You&apos;ll be able to track its status in your dashboard. Average first reply is within 24 hours.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/dashboard"
            className="rounded-full bg-espresso px-5 py-2.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90"
          >
            Track my complaints
          </Link>
          <button
            onClick={() => {
              setDone(false)
              setTitle("")
              setDescription("")
              setImage(null)
            }}
            className="rounded-full border border-espresso/15 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-terracotta/50"
          >
            File another
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl rounded-3xl border border-espresso/10 bg-card p-6 md:p-8">
      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-semibold">Which canteen?</label>
          <div className="grid gap-2 sm:grid-cols-2">
            {canteens.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCanteenId(c.id)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left text-sm transition-all",
                  canteenId === c.id
                    ? "border-terracotta bg-terracotta/10 ring-1 ring-terracotta"
                    : "border-espresso/12 hover:border-terracotta/40",
                )}
              >
                <span className="font-semibold">{c.canteenName}</span>
                <span className="block text-xs text-espresso/50">{c.location}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Undercooked rice at lunch"
            className="w-full rounded-2xl border border-espresso/12 bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Describe the issue</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder="Tell us what happened, when, and any details that help us investigate."
            className="w-full resize-none rounded-2xl border border-espresso/12 bg-background px-4 py-3 text-sm outline-none transition-colors focus:border-terracotta"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">Photo evidence (optional)</label>
          {image ? (
            <div className="relative inline-block">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image || "/placeholder.svg"} alt="Complaint evidence preview" className="h-40 w-auto rounded-2xl object-cover" />
              <button
                type="button"
                onClick={() => setImage(null)}
                className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-espresso text-background"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-dashed border-espresso/25 bg-background py-8 text-sm text-espresso/55 transition-colors hover:border-terracotta/50">
              <ImagePlus className="h-5 w-5" /> Click to upload a photo
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
            </label>
          )}
        </div>

        <button
          type="submit"
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-espresso py-3.5 text-sm font-semibold text-background transition-colors hover:bg-espresso/90 disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {busy ? "Submitting..." : "Submit complaint"}
        </button>
      </div>
    </form>
  )
}
