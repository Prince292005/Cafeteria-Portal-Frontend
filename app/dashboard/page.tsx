import type { Metadata } from "next"
import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { StudentDashboard } from "@/components/dashboard/student-dashboard"

export const metadata: Metadata = {
  title: "Dashboard — Cafeteria Portal",
}

export default function DashboardPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-[70vh] bg-gradient-to-b from-cream to-background">
        <StudentDashboard />
      </main>
      <Footer />
    </>
  )
}
