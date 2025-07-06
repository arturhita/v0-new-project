import { notFound } from "next/navigation"
import { getOperatorByStageName } from "@/lib/actions/operator.actions"
import { getReviewsForOperator } from "@/lib/actions/reviews.actions"
import { OperatorProfileClient } from "@/components/operator-profile-client"
import { SiteNavbar } from "@/components/site-navbar"

interface OperatorProfilePageProps {
  params: {
    operatorName: string
  }
}

// Questa ora è una Server Component, come raccomandato da Next.js
export default async function OperatorProfilePage({ params }: OperatorProfilePageProps) {
  const operatorName = decodeURIComponent(params.operatorName)

  // 1. Carica i dati dell'operatore dal server
  const operator = await getOperatorByStageName(operatorName)

  // 2. Se l'operatore non esiste, mostra una pagina 404
  if (!operator) {
    notFound()
  }

  // 3. Carica le recensioni per quell'operatore
  const reviews = await getReviewsForOperator(operator.id)

  // 4. Passa i dati al componente client che gestirà l'interattività
  return (
    <div className="bg-slate-900 min-h-screen">
      <SiteNavbar />
      <main className="pt-20">
        <OperatorProfileClient operator={operator} reviews={reviews} />
      </main>
    </div>
  )
}
