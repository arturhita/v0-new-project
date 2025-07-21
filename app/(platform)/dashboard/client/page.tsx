import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ClientDashboardClientPage from "./ClientDashboardClientPage"
import { getClientDashboardStats, getFavoriteExperts } from "@/lib/actions/client.actions"
import { unstable_noStore as noStore } from "next/cache"

export default async function ClientDashboardPage() {
  noStore()
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const [dashboardData, favoriteExperts] = await Promise.all([
    getClientDashboardStats(user.id),
    getFavoriteExperts(user.id),
  ])

  return <ClientDashboardClientPage initialStats={dashboardData} initialFavoriteExperts={favoriteExperts} />
}
