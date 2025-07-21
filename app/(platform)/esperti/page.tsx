import { getAllOperators } from "@/lib/actions/data.actions"
import EspertiClientPage from "./[categoria]/EspertiClientPage"
import type { Operator } from "@/components/operator-card"

export default async function EspertiPage() {
  const operators: Operator[] = await getAllOperators()

  // Passa un oggetto params generico per riutilizzare il componente client
  const genericParams = { categoria: "tutti" }

  return <EspertiClientPage initialOperators={operators} params={genericParams} />
}
