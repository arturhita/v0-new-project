import { Suspense } from "react"
import { ClientDashboardClientPage } from "./ClientDashboardClientPage"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function ClientDashboardPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <ClientDashboardClientPage />
    </Suspense>
  )
}
