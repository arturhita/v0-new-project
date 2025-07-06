"use client"
import { SiteNavbar } from "@/components/site-navbar"
import { notFound } from "next/navigation"
import { getOperatorByStageName } from "@/lib/actions/operator.actions"
import { getReviewsForOperator } from "@/lib/actions/reviews.actions"
import { OperatorProfileClient } from "@/components/operator-profile-client"

interface OperatorProfilePageProps {
  params: {
    operatorName: string
  }
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const operatorName = decodeURIComponent(params.operatorName)
  const operator = await getOperatorByStageName(operatorName)

  if (!operator) {
    notFound()
  }

  const reviews = await getReviewsForOperator(operator.id)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-blue-100 to-blue-300 text-slate-800">
      <SiteNavbar />
      <div className="container mx-auto px-4 py-24">
        <OperatorProfileClient operator={operator} reviews={reviews} />
      </div>
    </div>
  )
}
