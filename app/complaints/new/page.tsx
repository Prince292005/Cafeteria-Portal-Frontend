import { Suspense } from "react"
import type { Metadata } from "next"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { PageHero } from "@/components/site/page-hero"
import { ComplaintForm } from "@/components/complaints/complaint-form"

export const metadata: Metadata = {
  title: "Raise a complaint — Cafeteria Portal",
  description: "Report a food quality, hygiene, or service issue to the campus food committee.",
}

export default function NewComplaintPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Your voice matters"
          title="Raise a complaint."
          description="Report hygiene, quality, pricing, or service issues. Every complaint reaches the food committee and gets a status you can track."
        />
        <section className="mx-auto max-w-6xl px-4 py-12">
          <Suspense fallback={<div className="mx-auto max-w-2xl rounded-3xl border border-espresso/10 bg-card p-8 text-center text-sm text-espresso/50">Loading form...</div>}>
            <ComplaintForm />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  )
}
