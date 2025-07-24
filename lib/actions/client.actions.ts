"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getClientDashboardData(clientId: string) {
  noStore()
  const supabase = createClient()

  const profilePromise = supabase.from("profiles").select("full_name, avatar_url, wallet_balance").eq("id", clientId).single()
  const consultationsPromise = supabase.from("consultations").select("*").eq("client_id", clientId).order("created_at", { ascending: false }).limit(5)
  const favoritesPromise = supabase.from("favorites").select("operator_id, profiles(stage_name, avatar_url, is_online)").eq("client_id", clientId)

  const [
      { data: profile, error: profileError }, 
      { data: recentConsultations, error: consultationsError },
      { data: favoriteOperators, error: favoritesError }
    ] = await Promise.all([profilePromise, consultationsPromise, favoritesPromise])


  if (profileError || consultationsError || favoritesError) {
    console.error("Errore caricamento dati dashboard cliente:", profileError || consultationsError || favoritesError)
    return null
  }

  // **LA CORREZIONE**: Anche qui, sanifichiamo il profilo del cliente.
  const sanitizedProfile = JSON.parse(JSON.stringify(profile))

  return {
    profile: sanitizedProfile,
    recentConsultations: recentConsultations || [],
    favoriteOperators: favoriteOperators || [],
  }
}
