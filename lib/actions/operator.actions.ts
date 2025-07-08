"use server"

import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"

// Questa action recupera tutti gli operatori approvati dal database.
export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      profiles (
        id,
        full_name,
        avatar_url
      )
    `,
    )
    .eq("status", "approved")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  // Trasformiamo i dati per un uso più semplice nei componenti
  return data.map((op) => ({
    id: op.profiles.id,
    stageName: op.stage_name,
    bio: op.bio,
    specialties: op.specialties,
    avatarUrl: op.profiles.avatar_url,
    isOnline: true, // Placeholder per ora
  }))
}

// Questa action recupera un singolo operatore tramite il suo nome d'arte.
export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_details")
    .select(
      `
      stage_name,
      bio,
      specialties,
      profiles (
        id,
        full_name,
        avatar_url
      ),
      services (
        service_type,
        price,
        is_enabled
      )
    `,
    )
    .eq("stage_name", stageName)
    .eq("status", "approved")
    .single()

  if (error || !data) {
    console.error("Error fetching operator by stage name:", error)
    notFound() // Se l'operatore non viene trovato, mostra una pagina 404
  }

  // Trasformiamo i dati per il componente della pagina dettaglio
  return {
    id: data.profiles.id,
    stageName: data.stage_name,
    fullName: data.profiles.full_name,
    bio: data.bio,
    specialties: data.specialties,
    avatarUrl: data.profiles.avatar_url,
    services: data.services,
    isOnline: true, // Placeholder
  }
}
