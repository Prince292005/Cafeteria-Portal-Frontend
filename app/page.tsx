import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/home/hero"
import { AnnouncementTicker } from "@/components/home/announcement-ticker"
import { CanteensPreview } from "@/components/home/canteens-preview"
import { FeedbackHighlight } from "@/components/home/feedback-highlight"
import { CommitteePreview } from "@/components/home/committee-preview"
import { AnnouncementsSection } from "@/components/home/announcements-section"
import { HowItWorks } from "@/components/home/how-it-works"

export default function Page() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <AnnouncementTicker />
        <CanteensPreview />
        <FeedbackHighlight />
        <CommitteePreview />
        <AnnouncementsSection />
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
