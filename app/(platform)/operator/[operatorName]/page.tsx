import { getOperatorByUsername } from "@/lib/actions/operator.public.actions"
import { getReviewsByOperatorId } from "@/lib/actions/reviews.actions"
import OperatorProfileClient from "@/components/operator-profile-client"
import { notFound } from "next/navigation"

type OperatorPageProps = {
  params: {
    operatorName: string
  }
}

export default async function OperatorPage({ params }: OperatorPageProps) {
  const operatorName = decodeURIComponent(params.operatorName)
  const operator = await getOperatorByUsername(operatorName)

  if (!operator) {
    notFound()
  }

  const reviews = await getReviewsByOperatorId(operator.id)

  return <OperatorProfileClient operator={operator} reviews={reviews} />
}
