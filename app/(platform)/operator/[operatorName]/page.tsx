import { getOperatorByUsername } from "@/lib/actions/operator.public.actions"
import { getReviewsForOperator } from "@/lib/actions/reviews.actions"
import { OperatorProfileClient } from "@/components/operator-profile-client"
import { notFound } from "next/navigation"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

function ProfileSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
        <div className="lg:col-span-1 space-y-6">
          <Skeleton className="w-48 h-48 rounded-full mx-auto" />
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Skeleton className="h-12 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </div>
  )
}

export default async function OperatorPage({ params }: { params: { operatorName: string } }) {
  const stageName = decodeURIComponent(params.operatorName)

  const operator = await getOperatorByUsername(stageName)

  if (!operator) {
    notFound()
  }

  const reviews = await getReviewsForOperator(operator.id)

  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <OperatorProfileClient operator={operator} reviews={reviews} />
    </Suspense>
  )
}
