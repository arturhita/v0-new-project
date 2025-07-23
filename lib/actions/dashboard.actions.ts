"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

export async function getOperatorDashboardData(userId: string) {
  if (!userId) {
    throw new Error("User ID is required to fetch operator dashboard data.")
  }

  const supabase = supabaseAdmin

  const { data, error } = await supabase.rpc("get_operator_dashboard_stats", {
    p_operator_id: userId,
  })

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    throw new Error("Could not fetch operator dashboard data.")
  }

  if (!data || data.length === 0) {
    return null
  }

  // LA CORREZIONE DEFINITIVA: Sanifica i dati immediatamente dopo averli ricevuti.
  // Questo converte l'oggetto Supabase potenzialmente "congelato" in un semplice oggetto JS.
  const sanitizedData = JSON.parse(JSON.stringify(data[0]))

  return sanitizedData
}
