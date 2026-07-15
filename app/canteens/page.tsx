import type { Metadata } from "next"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { PageHero } from "@/components/site/page-hero"
import { CanteensExplorer } from "@/components/canteens/canteens-explorer"

export const metadata: Metadata = {
  title: "Canteens — Cafeteria Portal",
  description: "Browse every canteen on campus, compare ratings, and check today's menu.",
}

export default function CanteensPage() {
  return (
    <>
      <Navbar />
      <main>
        <PageHero
          eyebrow="Where to eat"
          title="Every canteen on campus, one honest list."
          description="Compare ratings, cuisines, hours, and price — then rate what you eat to keep it accurate for everyone."
        />
        <section className="mx-auto max-w-6xl px-4 py-12">
          <CanteensExplorer />
        </section>
      </main>
      <Footer />
    </>
  )
}
