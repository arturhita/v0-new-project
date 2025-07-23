"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function startConsultation(client_id: string, operator_id: string, service_type: "chat" | "call") {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("start_live_consultation", {
    p_client_id: client_id,
    p_operator_id: operator_id,
    p_service_type: service_type,
  })

  if (error) {
    console.error("Error starting consultation:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function endConsultation(live_consultation_id: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("end_live_consultation", {
    p_live_consultation_id: live_consultation_id,
  })

  if (error) {
    console.error("Error ending consultation:", error)
    return { success: false, error: error.message }
  }

  return { success: true, data }
}

export async function requestConsultation(
  operator_id: string,
  service_type: "chat" | "call",
): Promise<{ success: boolean; error?: string; data?: { live_consultation_id: string } }> {
  const supabase = createClient() // Use user-context client to get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Utente non autenticato." }
  }

  const client_id = user.id
  const adminSupabase = createAdminClient()

  // 1. Check if the user can start the consultation
  const { data: checkData, error: checkError } = await adminSupabase.rpc("can_start_consultation", {
    p_client_id: client_id,
    p_operator_id: operator_id,
    p_service_type: service_type,
  })

  if (checkError) {
    console.error("Error checking consultation possibility:", checkError)
    return { success: false, error: "Errore durante la verifica dei requisiti." }
  }

  if (checkData.can_start === false) {
    return { success: false, error: checkData.reason }
  }

  // 2. If check passes, start the consultation
  const { data: startData, error: startError } = await adminSupabase.rpc("start_live_consultation", {
    p_client_id: client_id,
    p_operator_id: operator_id,
    p_service_type: service_type,
  })

  if (startError) {
    console.error("Error starting consultation:", startError)
    return { success: false, error: "Impossibile avviare la consulenza." }
  }

  // Return the ID of the newly created live_consultations record
  return { success: true, data: { live_consultation_id: startData } }
}
