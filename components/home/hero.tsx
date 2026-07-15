"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Star, UtensilsCrossed } from "lucide-react"
import { useCanteens, useStats } from "@/lib/mock/store"

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 === 0 ? 0 : 1)}k`
  return String(n)
}

export function Hero() {
  const stats = useStats()
  const canteens = useCanteens()

  // Pick the top-rated canteen for the floating card
  const topCanteen = canteens.length > 0
    ? [...canteens].sort((a, b) => b.rating - a.rating)[0]
    : null

  const displayStats = [
    { value: String(stats.canteens), label: "campus canteens" },
    { value: formatCount(stats.responses), label: "student ratings" },
    { value: stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)}/5` : "—", label: "avg. campus rating" },
  ]

  return (
    <section className="relative overflow-hidden">
      <div className="grain pointer-events-none absolute inset-0 opacity-60" />
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-10 pt-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:px-8 lg:pt-20">
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 rounded-full border border-espresso/15 bg-card px-3.5 py-1.5 text-sm font-medium text-espresso/70"
          >
            <span className="flex h-2 w-2 rounded-full bg-forest" />
            The student-run cafeteria portal
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mt-6 text-balance font-serif text-5xl font-semibold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl"
          >
            Campus dining,
            <br />
            <span className="text-terracotta">honestly</span> served.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.12 }}
            className="mt-6 max-w-md text-pretty text-lg leading-relaxed text-espresso/65"
          >
            Browse every canteen on campus, rate today&apos;s meal in five seconds,
            and raise complaints that actually get answered. Built by students, for
            students.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.19 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              href="/canteens"
              className="group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3.5 text-base font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              Explore canteens
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/complaints/new"
              className="inline-flex items-center gap-2 rounded-full border border-espresso/20 px-6 py-3.5 text-base font-semibold text-espresso transition-colors hover:bg-espresso/5"
            >
              Raise a complaint
            </Link>
          </motion.div>

          <motion.dl
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-espresso/10 pt-6"
          >
            {displayStats.map((s) => (
              <div key={s.label}>
                <dt className="font-serif text-3xl font-semibold">{s.value}</dt>
                <dd className="mt-1 text-xs leading-tight text-espresso/55">{s.label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-espresso/10 shadow-2xl shadow-espresso/15 sm:aspect-square lg:aspect-[4/5]">
            <Image
              src="/images/hero-spread.png"
              alt="An overhead spread of dishes from a campus canteen"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover"
            />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20, x: -10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute -left-3 bottom-8 rounded-2xl border border-espresso/10 bg-card p-4 shadow-xl shadow-espresso/10 sm:-left-6"
          >
            <div className="flex items-center gap-1 text-turmeric">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-turmeric" />
              ))}
            </div>
            <p className="mt-2 font-serif text-2xl font-semibold leading-none">
              {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : "—"}
              <span className="text-base text-espresso/50">/5</span>
            </p>
            <p className="mt-1 text-xs text-espresso/55">campus-wide, all time</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20, x: 10 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -right-2 top-8 flex items-center gap-3 rounded-2xl border border-espresso/10 bg-card p-3.5 shadow-xl shadow-espresso/10 sm:-right-5"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-forest text-forest-foreground">
              <UtensilsCrossed className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold leading-tight">{topCanteen ? "Top rated canteen" : "Campus dining"}</p>
              <p className="text-xs text-espresso/55">{topCanteen ? `${topCanteen.canteenName} · ${topCanteen.rating.toFixed(1)}★` : "Rate your meal today"}</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
