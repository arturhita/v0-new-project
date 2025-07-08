"use client"
import { HomePageClient } from "./HomePageClient"
import { getApprovedOperators, getRecentReviews } from "@/lib/actions/data.actions"

// This is now a React Server Component
export default async function UnveillyHomePage() {
  // We fetch data on the server
  const operators = await getApprovedOperators()
  const reviews = await getRecentReviews()

  // And pass it as props to the Client Component
  return <HomePageClient operators={operators} allReviews={reviews} />
}
