import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getClientDashboardStats, getFavoriteExperts } from "@/lib/actions/client.actions"
import ClientDashboardClientPage from "./ClientDashboardClientPage"
import LoadingSpinner from "@/components/loading-spinner"
import { Suspense } from "react"

export default async function ClientDashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Recupera i dati in parallelo
  const [stats, favoriteExperts] = await Promise.all([getClientDashboardStats(user.id), getFavoriteExperts(user.id)])

  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-slate-900">
          <LoadingSpinner />
        </div>
      }
    >
      <ClientDashboardClientPage user={user} initialStats={stats} initialFavoriteExperts={favoriteExperts} />
    </Suspense>
  )
}
