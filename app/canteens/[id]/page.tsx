import { Navbar } from "@/components/site/navbar"
import { Footer } from "@/components/site/footer"
import { CanteenDetail } from "@/components/canteens/canteen-detail"

export default async function CanteenDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <>
      <Navbar />
      <main>
        <CanteenDetail id={Number(id)} />
      </main>
      <Footer />
    </>
  )
}
