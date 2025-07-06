import { getOperatorByStageName } from "@/lib/actions/operator.actions"
import { OperatorProfileClient } from "@/components/operator-profile-client"
import { notFound } from "next/navigation"

export default async function OperatorProfilePage({ params }: { params: { operatorName: string } }) {
  const operatorName = decodeURIComponent(params.operatorName)

  const operator = await getOperatorByStageName(operatorName)

  if (!operator) {
    notFound()
  }

  // Example of fetching related data
  // const reviews = await getReviewsForOperator(operator.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <OperatorProfileClient
        operator={operator}
        // reviews={reviews}
      />
    </div>
  )
}
