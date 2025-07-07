"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

// Tipo per i dati dell'operatore che passiamo ai componenti, con dati aggregati
export type OperatorCardData = Database["public"]["Tables"]["profiles"]["Row"] & {
  services: Array<Database["public"]["Tables"]["services"]["Row"]>
  averageRating: number
  reviewsCount: number
}

// Funzione interna per trasformare i dati dal DB a quelli per i componenti
function transformOperatorData(operators: any[]): OperatorCardData[] {
  if (!operators) return []
  return operators.map((op) => {
    const reviews = op.reviews || []
    const reviewsCount = reviews.length
    const averageRating =
      reviewsCount > 0 ? reviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewsCount : 0

    return {
      ...op,
      averageRating: Number.parseFloat(averageRating.toFixed(1)),
      reviewsCount,
    }
  })
}

// Funzione per prendere tutti gli operatori approvati e visibili
export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    return []
  }

  return transformOperatorData(data)
}

// Funzione per prendere gli operatori per categoria
export async function getOperatorsByCategory(category: string): Promise<OperatorCardData[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .contains("specializations", [category])

  if (error) {
    console.error("Error fetching operators by category:", error.message)
    return []
  }

  return transformOperatorData(data)
}

// Funzione per prendere un singolo operatore dal suo ID
export async function getOperatorById(id: string): Promise<OperatorCardData | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*), reviews(rating)")
    .eq("id", id)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error(`Error fetching operator ${id}:`, error.message)
    return null
  }

  return transformOperatorData([data])[0]
}
