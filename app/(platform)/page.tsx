import { getApprovedOperators, getRecentReviews } from "@/lib/actions/data.actions"
import { HomePageClient } from "./HomePageClient"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Moonthir - Il Tuo Viaggio Inizia Qui",
  description:
    "Trova la tua guida spirituale. Esperti in cartomanzia, astrologia e numerologia disponibili 24/7 per svelare i misteri del tuo destino.",
}

export const revalidate = 300 // Revalidate every 5 minutes

export default async function UnveillyHomePage() {
  const operators = await getApprovedOperators()
  const reviews = await getRecentReviews()

  return <HomePageClient operators={operators} allReviews={reviews} />
}
