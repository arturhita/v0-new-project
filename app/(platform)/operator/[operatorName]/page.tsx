import { getOperatorPublicProfile } from "@/lib/actions/operator.actions"
import { notFound } from "next/navigation"
import OperatorProfileClientPage from "./OperatorProfileClientPage"

type OperatorProfilePageProps = {
  params: {
    operatorName: string
  }
}

export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const operatorName = decodeURIComponent(params.operatorName)
  const profileData = await getOperatorPublicProfile(operatorName)

  if (!profileData) {
    notFound()
  }

  return <OperatorProfileClientPage profileData={profileData} />
}
