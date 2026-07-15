"use client"

import Link from "next/link"
import { ArrowRight, MessageSquareWarning, Search, Star } from "lucide-react"
import { SectionHeading } from "@/components/kit/section-heading"
import { Reveal } from "@/components/kit/reveal"

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Discover your canteen",
    body: "Browse every spot on campus with live ratings, full menus, hours, and hygiene status.",
  },
  {
    icon: Star,
    step: "02",
    title: "Rate what you eat",
    body: "Drop a five-second rating or a detailed review. Build a streak and earn points as you go.",
  },
  {
    icon: MessageSquareWarning,
    step: "03",
    title: "Raise it, resolve it",
    body: "Something off? File a complaint with a photo and track it until the committee closes it out.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps to better campus food"
        align="center"
      />

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {steps.map((s, i) => (
          <Reveal key={s.step} delay={i * 0.1}>
            <div className="relative flex h-full flex-col rounded-3xl border border-espresso/10 bg-card p-7">
              <span className="font-serif text-5xl font-semibold text-espresso/10">{s.step}</span>
              <span className="mt-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/12 text-terracotta">
                <s.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 font-serif text-2xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-pretty leading-relaxed text-espresso/60">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.2}>
        <div className="mt-14 overflow-hidden rounded-[2rem] bg-terracotta px-8 py-12 text-center text-primary-foreground sm:px-12">
          <h3 className="mx-auto max-w-2xl text-balance font-serif text-3xl font-semibold leading-tight sm:text-4xl">
            Ready to make campus dining better?
          </h3>
          <p className="mx-auto mt-3 max-w-lg text-pretty text-primary-foreground/85">
            Join thousands of students already rating meals, raising issues, and
            shaping the menu.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-full bg-espresso px-6 py-3.5 font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              Create your account
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/canteens"
              className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 px-6 py-3.5 font-semibold transition-colors hover:bg-primary-foreground/10"
            >
              Browse as a guest
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
