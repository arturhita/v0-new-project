import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function DashboardPageSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/3 rounded-md" />
        <Skeleton className="h-5 w-2/3 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <Skeleton className="h-5 w-2/5 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-3/5 rounded-md" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <Skeleton className="h-5 w-2/5 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-3/5 rounded-md" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <Skeleton className="h-5 w-2/5 rounded-md" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-3/5 rounded-md" />
            <Skeleton className="mt-2 h-4 w-4/5 rounded-md" />
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <Skeleton className="h-6 w-1/4 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 p-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
            <div className="flex items-center space-x-4 p-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
            <div className="flex items-center space-x-4 p-2">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-full rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
