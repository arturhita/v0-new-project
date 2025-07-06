"use server"

import { createClient } from "@/lib/supabase/server"
import type { UserProfile } from "@/types/user.types"

export async function getAllOperators(): Promise<UserProfile[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id,
      name,
      nickname,
      avatar_url,
      bio,
      is_online,
      specialties,
      services
    `,
    )
    .eq("role", "operator")
    .eq("status", "approved") // Mostriamo solo gli operatori approvati

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data as UserProfile[]
}

export async function getOperatorById(id: string): Promise<{ data: UserProfile | null; error: any }> {
  const supabase = createClient()

  // Validazione base dell'ID per evitare errori noti
  if (!id || id.length < 36) {
    return { data: null, error: { message: "ID operatore non valido." } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).eq("role", "operator").single() // .single() è più efficiente e restituisce un oggetto o un errore se non trova nulla

  if (error) {
    console.error(`Error fetching operator by id (${id}):`, error)
    return { data: null, error: { message: "Impossibile caricare l'operatore." } }
  }

  return { data: data as UserProfile, error: null }
}

// Le altre funzioni come createOperator e updateOperatorCommission rimangono invariate
// ma andrebbero modificate per interagire con Supabase invece che con dati mock.
// Per ora le lasciamo così per non allargare troppo il campo.
