"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function requestConsultation(operatorId: string, serviceType: "chat" | "call") {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Devi essere loggato per iniziare una consulenza." }
  }

  const { data, error } = await supabase.rpc("request_consultation", {
    p_client_id: user.id,
    p_operator_id: operatorId,
    p_service_type: serviceType,
  })

  if (error) {
    console.error("Error requesting consultation:", error)
    return { success: false, error: error.message }
  }

  return { success: true, consultationId: data }
}

export async function endConsultation(
  consultationId: string,
): Promise<{ success: boolean; error?: string; message?: string }> {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Utente non autenticato." }
  }

  const { error } = await supabase.rpc("end_live_consultation", {
    p_consultation_id: consultationId,
    p_user_id: user.id,
  })

  if (error) {
    console.error("Error ending consultation (RPC):", error)
    if (error.message.includes("Consultation not found or already completed")) {
      return { success: false, error: "Consultazione non trovata o già terminata." }
    }
    if (error.message.includes("User is not part of this consultation")) {
      return { success: false, error: "Non sei autorizzato a terminare questa consultazione." }
    }
    return { success: false, error: "Si è verificato un errore nel terminare la consultazione." }
  }

  revalidatePath("/(platform)/dashboard/client/wallet")
  revalidatePath("/(platform)/dashboard/operator/earnings")

  return { success: true, message: "Consultazione terminata e fatturata con successo." }
}
