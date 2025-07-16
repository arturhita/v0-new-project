import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"
import HomePageClient from "./home-page-client"
import type { Operator as OperatorType } from "@/components/operator-card"
import { mockOperators } from "./home-page-client"

export const revalidate = 3600 // Revalida i dati ogni ora

export default async function UnveillyHomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let operators: OperatorType[] = []
  try {
    const fetchedOperators = await getOperators({ limit: 8 })
    if (fetchedOperators && fetchedOperators.length > 0) {
      operators = fetchedOperators as OperatorType[]
    } else {
      console.log("Nessun operatore trovato nel database, utilizzo dati mock.")
      operators = mockOperators.slice(0, 8)
    }
  } catch (error) {
    console.error("Errore nel recupero degli operatori, utilizzo dati mock:", error)
    operators = mockOperators.slice(0, 8)
  }

  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return <HomePageClient user={user} operators={operators} newTalents={newTalents} />
}
