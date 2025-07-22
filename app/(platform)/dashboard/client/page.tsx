import { getClientDashboardData } from "@/lib/actions/client.actions"
import ClientDashboardClientPage from "./ClientDashboardClientPage"
import { Suspense } from "react"
import LoadingSpinner from "@/components/loading-spinner"

export default async function ClientDashboardPage() {
  const dashboardData = await getClientDashboardData()

  if (!dashboardData) {
    return <div>Errore nel caricamento dei dati della dashboard.</div>
  }

  return (
    <Suspense fallback={<LoadingSpinner fullScreen message="Caricamento dashboard..." />}>
      <ClientDashboardClientPage initialData={dashboardData} />
    </Suspense>
  )
}
