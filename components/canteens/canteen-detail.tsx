"use client"

import Link from "next/link"
import { notFound } from "next/navigation"
import { motion } from "motion/react"
import {
  ArrowLeft,
  BadgeCheck,
  Clock,
  FileText,
  Leaf,
  MapPin,
  MessageSquareWarning,
  ShieldCheck,
} from "lucide-react"
import { useCanteen } from "@/lib/mock/store"
import { resolveFileUrl } from "@/lib/api"
import { Stars } from "@/components/kit/stars"
import { CanteenImage } from "@/components/kit/canteen-image"
import { QuickFeedback } from "@/components/feedback/quick-feedback"
import { DetailedFeedback } from "@/components/feedback/detailed-feedback"
import { cn } from "@/lib/utils"

const accentBg: Record<string, string> = {
  terracotta: "bg-terracotta",
  turmeric: "bg-turmeric",
  forest: "bg-forest",
  sky: "bg-sky",
  crimson: "bg-crimson",
  royal: "bg-royal",
  slate: "bg-slate",
}

export function CanteenDetail({ id }: { id: number }) {
  const canteen = useCanteen(id)
  if (!canteen) return notFound()

  return (
    <div>
      <section className="relative">
        <div className="relative h-[42vh] min-h-[320px] w-full overflow-hidden">
          <CanteenImage canteen={canteen} fill priority sizes="100vw" className="object-cover" letterClassName="text-9xl" />
          <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-espresso/10" />
        </div>

        <div className="mx-auto max-w-6xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="-mt-16 rounded-3xl border border-espresso/10 bg-card p-6 shadow-2xl shadow-espresso/10 md:p-8"
          >
            <Link
              href="/canteens"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-espresso/60 transition-colors hover:text-terracotta"
            >
              <ArrowLeft className="h-4 w-4" /> All canteens
            </Link>

            <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-3 py-1 text-xs font-semibold text-background", accentBg[canteen.accent])}>
                    {canteen.cuisine}
                  </span>
                  {canteen.fssaiVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-forest/10 px-3 py-1 text-xs font-semibold text-forest">
                      <BadgeCheck className="h-3.5 w-3.5" /> FSSAI Verified
                    </span>
                  )}
                </div>
                <h1 className="mt-3 font-serif text-4xl font-semibold md:text-5xl">
                  {canteen.canteenName}
                </h1>
                <p className="mt-2 max-w-lg text-pretty text-espresso/60">{canteen.tagline}</p>
              </div>

              <div className="shrink-0 whitespace-nowrap rounded-2xl border border-espresso/10 bg-background px-5 py-4 text-center">
                <div className="flex items-center justify-center gap-2 leading-none">
                  <span className="font-serif text-3xl font-semibold leading-none">{canteen.rating.toFixed(1)}</span>
                  <Stars value={canteen.rating} size={16} />
                </div>
                <p className="mt-2 text-xs leading-none text-espresso/50">
                  {canteen.ratingCount.toLocaleString()} student ratings
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Info icon={<MapPin className="h-4 w-4" />} label="Location" value={canteen.location} />
              <Info icon={<Clock className="h-4 w-4" />} label="Hours" value={canteen.hours && canteen.hours !== "—" ? canteen.hours : "Not set"} />
              <Info
                icon={<span className="text-sm font-bold text-terracotta">{"₹".repeat(canteen.priceLevel)}</span>}
                label="Price"
                value={canteen.priceLevel === 1 ? "Budget" : canteen.priceLevel === 2 ? "Moderate" : "Premium"}
              />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <h2 className="font-serif text-3xl font-semibold">About</h2>
            <p className="mt-3 max-w-2xl text-pretty leading-relaxed text-espresso/70">{canteen.info}</p>

            {canteen.fssaiVerified && (
              <div className="mt-6 flex items-center gap-3 rounded-2xl border border-forest/20 bg-forest/5 p-4">
                <ShieldCheck className="h-6 w-6 shrink-0 text-forest" />
                <div>
                  <p className="text-sm font-semibold text-forest">Hygiene &amp; safety certified</p>
                  <a
                    href={resolveFileUrl(canteen.fssaiCertificateUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-espresso/55 underline underline-offset-2 hover:text-forest"
                  >
                    View FSSAI certificate
                  </a>
                </div>
              </div>
            )}

            <div className="mt-10 flex items-center justify-between">
              <h2 className="font-serif text-3xl font-semibold">Today&apos;s menu</h2>
              {canteen.menuFilePath && (
                <a
                  href={resolveFileUrl(canteen.menuFilePath)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full bg-espresso px-4 py-2 text-xs font-semibold text-background transition-colors hover:bg-espresso/90"
                >
                  <FileText className="h-3.5 w-3.5" /> View full menu
                </a>
              )}
            </div>

            {canteen.menu.length === 0 && !canteen.menuFilePath && (
              <p className="mt-4 text-sm text-espresso/50">
                This canteen hasn&apos;t added a menu yet. Check back soon.
              </p>
            )}

            {canteen.menu.length === 0 && canteen.menuFilePath && (
              <a
                href={resolveFileUrl(canteen.menuFilePath)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 flex items-center gap-4 rounded-2xl border border-espresso/10 bg-card p-5 transition-colors hover:border-terracotta/40"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-terracotta/10 text-terracotta">
                  <FileText className="h-6 w-6" />
                </span>
                <div>
                  <p className="font-medium">View this canteen&apos;s menu</p>
                  <p className="mt-0.5 text-sm text-espresso/55">Opens the menu {canteen.menuFilePath.toLowerCase().endsWith(".pdf") ? "PDF" : "photo"} in a new tab.</p>
                </div>
              </a>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {canteen.menu.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl border border-espresso/10 bg-card p-4"
                >
                  <div className="flex items-start gap-2.5">
                    <span
                      className={cn(
                        "mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border",
                        item.veg ? "border-forest" : "border-terracotta",
                      )}
                    >
                      <span className={cn("h-2 w-2 rounded-full", item.veg ? "bg-forest" : "bg-terracotta")} />
                    </span>
                    <div>
                      <p className="font-medium leading-tight">{item.name}</p>
                      {item.tag && (
                        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-turmeric/20 px-2 py-0.5 text-[11px] font-semibold text-espresso">
                          <Leaf className="h-3 w-3" /> {item.tag}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-serif text-lg font-semibold">₹{item.price}</span>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <DetailedFeedback canteenId={canteen.id} canteenName={canteen.canteenName} />
            </div>
          </div>

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <QuickFeedback canteenId={canteen.id} canteenName={canteen.canteenName} />
            <Link
              href={`/complaints/new?canteen=${canteen.id}`}
              className="flex items-center gap-3 rounded-3xl border border-terracotta/25 bg-terracotta/5 p-6 transition-colors hover:bg-terracotta/10"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-terracotta text-background">
                <MessageSquareWarning className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">Something wrong?</p>
                <p className="text-sm text-espresso/60">Raise a complaint about {canteen.canteenName}.</p>
              </div>
            </Link>
          </aside>
        </div>
      </section>
    </div>
  )
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-espresso/10 bg-background p-4">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cream text-espresso/70">
        {icon}
      </span>
      <div>
        <p className="text-xs uppercase tracking-wide text-espresso/45">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  )
}
