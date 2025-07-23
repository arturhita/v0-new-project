"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Inizia una nuova consultazione
export async function startConsultationAction(operatorId: string, serviceId: string, type: "chat" | "call") {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { success: false, message: "Utente non autenticato." }
  }

  // Controlla il saldo del cliente e la tariffa del servizio
  const { data: service, error: serviceError } = await supabaseAdmin
    .from("operator_services")
    .select("rate_per_minute")
    .eq("id", serviceId)
    .single()

  if (serviceError || !service) {
    return { success: false, message: "Servizio non trovato o non valido." }
  }

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("wallets")
    .select("balance")
    .eq("user_id", user.id)
    .single()

  if (walletError || !wallet) {
    return { success: false, message: "Portafoglio non trovato." }
  }

  if (wallet.balance < service.rate_per_minute) {
    return {
      success: false,
      message: "Credito insufficiente per avviare la consultazione. Per favore, ricarica il tuo portafoglio.",
    }
  }

  // Crea il record della consultazione
  const { data: consultation, error: consultationError } = await supabaseAdmin
    .from("consultations")
    .insert({
      client_id: user.id,
      operator_id: operatorId,
      service_id: serviceId,
      status: "active",
      type: type,
      started_at: new Date().toISOString(),
      last_billed_at: new Date().toISOString(), // Inizializza l'ultimo addebito a ora
    })
    .select()
    .single()

  if (consultationError) {
    return { success: false, message: consultationError.message }
  }

  return { success: true, consultationId: consultation.id }
}

// Termina una consultazione
export async function endConsultationAction(consultationId: string) {
  const { error } = await supabaseAdmin.rpc("end_consultation", {
    p_consultation_id: consultationId,
    p_reason: "ended_by_user",
  })

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/dashboard/client/consultations")
  revalidatePath("/dashboard/operator/consultations-history")
  return { success: true, message: "Consulto terminato con successo." }
}
