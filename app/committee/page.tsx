import type { Metadata } from "next"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { PageHero } from "@/components/site/page-hero"
import { CommitteeGrid } from "@/components/committee/committee-grid"

export const metadata: Metadata = {
  title: "Food Committee — Cafeteria Portal",
  description: "Meet the student-and-faculty food committee that keeps campus dining accountable.",
}

export default function CommitteePage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Who's behind this"
          title="The campus food committee."
          description="A team of students and faculty who review feedback, act on complaints, and audit hygiene across every canteen."
        />
        <section className="mx-auto max-w-6xl px-4 py-12">
          <CommitteeGrid />
        </section>
      </main>
      <Footer />
    </>
  )
}
