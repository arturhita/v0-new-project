import { createClient } from "@/lib/supabase/server"
import { getOperators } from "@/lib/actions/data.actions"
import HomePageClient from "./home-page-client"
import type { Operator as OperatorType } from "@/components/operator-card"
import { mockOperators } from "./home-page-client"

export default async function UnveillyHomePage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let operators: OperatorType[] = []
  try {
    // Tenta di recuperare gli operatori reali dal database
    const fetchedOperators = await getOperators({ limit: 8 })
    if (fetchedOperators && fetchedOperators.length > 0) {
      operators = fetchedOperators as OperatorType[]
    } else {
      // Se non ci sono operatori, usa i dati mock come fallback
      console.log("Nessun operatore trovato, utilizzo dati mock.")
      operators = mockOperators.slice(0, 8)
    }
  } catch (error) {
    // Se c'è un errore nel recupero, usa i dati mock
    console.error("Errore nel recupero degli operatori, utilizzo dati mock:", error)
    operators = mockOperators.slice(0, 8)
  }

  const newTalents = operators
    .filter((op) => op.joinedDate && new Date(op.joinedDate) > new Date(Date.now() - 10 * 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.joinedDate!).getTime() - new Date(a.joinedDate!).getTime())
    .slice(0, 3)

  return <HomePageClient user={user} operators={operators} newTalents={newTalents} />
}
