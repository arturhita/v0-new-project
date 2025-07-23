"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getClientDashboardStats(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_client_dashboard_stats", { p_client_id: clientId })
  if (error) throw error
  return data
}

export async function getFavoriteExperts(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("favorites").select("operator:operator_id(*)").eq("client_id", clientId)
  if (error) throw error
  return data
}

export async function toggleFavoriteOperator(clientId: string, operatorId: string, isFavorite: boolean) {
  const supabase = createClient()

  if (isFavorite) {
    const { error } = await supabase
      .from("favorite_operators")
      .delete()
      .match({ client_id: clientId, operator_id: operatorId })

    if (error) {
      return { success: false, error: error.message }
    }
  } else {
    const { error } = await supabase.from("favorite_operators").insert({ client_id: clientId, operator_id: operatorId })

    if (error) {
      return { success: false, error: error.message }
    }
  }

  revalidatePath("/dashboard/client")
  return { success: true }
}
