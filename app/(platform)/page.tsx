import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"
import HomePageClient, { mockOperators } from "./home-page-client"
import type { Operator as OperatorType } from "@/components/operator-card"

export default async function UnveillyHomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let operators: OperatorType[] = []
  try {
    // Tentativo di fetch degli operatori reali
    const fetchedOperators = await getOperators({ limit: 8 })
    if (fetchedOperators && fetchedOperators.length > 0) {
      operators = fetchedOperators as OperatorType[]
    } else {
      // Fallback ai dati mock se non ci sono operatori
      operators = mockOperators.slice(0, 8)
    }
  } catch (error) {
    console.error("Errore nel fetch degli operatori, utilizzo dati mock:", error)
    // Fallback ai dati mock in caso di errore
    operators = mockOperators.slice(0, 8)
  }

  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return <HomePageClient user={user} operators={operators} newTalents={newTalents} />
}
