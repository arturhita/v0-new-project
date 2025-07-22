import { getHomepageData } from "@/lib/actions/data.actions"
import { HomepageClient } from "./homepage-client"

// This is now an async Server Component
export default async function UnveillyHomePage() {
  // Data is fetched on the server.
  // The page's loading.tsx will act as the loading boundary.
  const { operators, reviews } = await getHomepageData()

  // The data is passed directly to the client component.
  return <HomepageClient operators={operators} reviews={reviews} />
}
