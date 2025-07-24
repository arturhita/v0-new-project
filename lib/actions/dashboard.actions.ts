"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export async function getOperatorDashboardData(operatorId: string) {
  noStore()
  const supabase = createClient()

  const profilePromise = supabase
    .from("profiles")
    .select(
      "stage_name, avatar_url, is_online, availability, services, average_rating, reviews_count, total_earnings, monthly_earnings",
    )
    .eq("id", operatorId)
    .single()

  // Esegui altre chiamate in parallelo se necessario
  const [
    { data: profile, error: profileError },
    // altre promise qui...
  ] = await Promise.all([
    profilePromise,
    // ...
  ])

  if (profileError) {
    console.error("Errore nel caricamento dati dashboard operatore:", profileError)
    return null
  }

  // **LA CORREZIONE**: Sanifichiamo l'oggetto `profile` non appena viene letto dal DB.
  // Questo garantisce che qualsiasi componente client riceva un oggetto pulito e modificabile.
  const sanitizedProfile = JSON.parse(JSON.stringify(profile))

  // Simula il recupero di altri dati
  const recentActivity = [
    { id: 1, description: "Nuova recensione da Mario Rossi", time: "2 ore fa" },
    { id: 2, description: "Consulenza completata con Laura Bianchi", time: "5 ore fa" },
  ]
  const upcomingConsultations = [
    { id: 1, clientName: "Paolo Verdi", time: "Domani alle 10:00", type: "Video" },
  ]

  return {
    profile: sanitizedProfile,
    recentActivity,
    upcomingConsultations,
  }
}
