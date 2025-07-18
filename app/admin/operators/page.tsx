"use client"
import { getOperatorsForAdmin } from "@/lib/actions/operator.actions"
import OperatorsList from "./operators-list"

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

export default async function AdminOperatorsPage() {
  const operators = await getOperatorsForAdmin()
  return <OperatorsList initialOperators={operators} />
}
