import type { Metadata } from "next"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { PageHero } from "@/components/site/page-hero"
import { AnnouncementsList } from "@/components/announcements/announcements-list"

export const metadata: Metadata = {
  title: "Announcements — Cafeteria Portal",
  description: "Latest updates from the campus food committee — menus, timings, and audits.",
}

export default function AnnouncementsPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Stay in the loop"
          title="Announcements."
          description="Special menus, extended hours during exams, hygiene audit results, and everything else worth knowing."
        />
        <section className="mx-auto max-w-3xl px-4 py-12">
          <AnnouncementsList />
        </section>
      </main>
      <Footer />
    </>
  )
}
