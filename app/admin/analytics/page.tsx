import { DashboardLayout } from "@/components/dashboard-layout"
import { ComprehensiveAnalyticsDashboard } from "@/components/comprehensive-analytics-dashboard"
import { getComprehensiveAnalytics } from "@/lib/actions/analytics.actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Suspense } from "react"

async function AnalyticsData() {
  const analyticsData = await getComprehensiveAnalytics()
  return <ComprehensiveAnalyticsDashboard initialData={analyticsData} />
}

export default function AdminAnalyticsPage() {
  return (
    <DashboardLayout userType="admin" title="Statistiche Avanzate">
      <p className="text-muted-foreground mb-6">
        Analizza le performance della piattaforma con metriche dettagliate su utenti, entrate e consulenze.
      </p>
      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsData />
      </Suspense>
    </DashboardLayout>
  )
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Skeleton className="h-80 w-full lg:col-span-2" />
        <Skeleton className="h-80 w-full" />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  )
}
