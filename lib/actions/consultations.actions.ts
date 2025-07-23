"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function startConsultationAction(client_id: string, operator_id: string, service_id: string) {
  const supabase = createClient()

  // 1. Controlla il saldo del cliente e il costo del servizio
  const { data: clientProfile, error: clientError } = await supabase
    .from("profiles")
    .select("wallet_balance")
    .eq("user_id", client_id)
    .single()

  if (clientError || !clientProfile) {
    return { success: false, message: "Impossibile trovare il profilo del cliente." }
  }

  const { data: service, error: serviceError } = await supabase
    .from("operator_services")
    .select("price_per_minute")
    .eq("id", service_id)
    .single()

  if (serviceError || !service) {
    return { success: false, message: "Impossibile trovare il servizio selezionato." }
  }

  if (clientProfile.wallet_balance < service.price_per_minute) {
    return {
      success: false,
      message: "Credito insufficiente per avviare la consultazione. Per favore, ricarica il tuo portafoglio.",
    }
  }

  // 2. Crea la riga di consultazione
  const { data: consultation, error: insertError } = await supabase
    .from("consultations")
    .insert({
      client_id,
      operator_id,
      service_id,
      status: "active",
      started_at: new Date().toISOString(),
      last_billed_at: new Date().toISOString(), // Imposta il primo 'last_billed_at' per evitare doppi addebiti immediati
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error starting consultation:", insertError)
    return { success: false, message: "Errore tecnico durante l'avvio della consultazione." }
  }

  return { success: true, message: "Consultazione avviata.", consultationId: consultation.id }
}

export async function endConsultationAction(consultationId: string, termination_reason = "Terminata dall'utente") {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("consultations")
    .update({
      status: "completed",
      ended_at: new Date().toISOString(),
      termination_reason: termination_reason,
    })
    .eq("id", consultationId)
    .select()
    .single()

  if (error) {
    console.error("Error ending consultation:", error)
    return { success: false, message: "Errore durante la chiusura della consultazione." }
  }

  revalidatePath(`/dashboard/client/consultations`)
  revalidatePath(`/dashboard/operator/consultations-history`)

  return { success: true, message: "Consultazione terminata con successo." }
}
