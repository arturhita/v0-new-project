"use client"
import { getAllOperators } from "@/lib/actions/operator.actions"
import OperatorsClientPage from "./operators-client-page"

// Definiamo un tipo più completo per l'operatore, basato sullo schema del DB
type OperatorProfile = {
  id: string
  name: string | null
  surname: string | null
  stage_name: string | null
  email: string | null
  status: "Attivo" | "In Attesa" | "Sospeso" | null
  commission_rate: number | null
  created_at: string
  avatar_url: string | null
}

export default async function OperatorsPage() {
  const operators = await getAllOperators()
  return <OperatorsClientPage initialOperators={operators} />
}
