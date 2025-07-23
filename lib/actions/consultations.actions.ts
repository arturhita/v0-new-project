"use server"
import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase/admin"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(amount)
}

export async function startConsultationAction(
  clientId: string,
  operatorId: string,
  serviceId: string,
  type: "chat" | "call",
): Promise<{ success: boolean; consultationId?: string; error?: string }> {
  // Usa l'admin client per operazioni sensibili
  const supabase = supabaseAdmin

  // 1. Controlla la validità del servizio e ottiene la tariffa
  const { data: service, error: serviceError } = await supabase
    .from("operator_services")
    .select("rate_per_minute")
    .eq("id", serviceId)
    .eq("operator_id", operatorId)
    .single()

  if (serviceError || !service) {
    console.error("Errore controllo servizio:", serviceError)
    return { success: false, error: "Il servizio selezionato non è valido o non è disponibile." }
  }

  // 2. Controlla il saldo del portafoglio del cliente
  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .select("balance")
    .eq("user_id", clientId)
    .single()

  if (walletError || !wallet) {
    console.error("Errore controllo portafoglio:", walletError)
    return { success: false, error: "Impossibile trovare il portafoglio del cliente." }
  }

  // Richiede almeno 1 minuto di credito per iniziare
  if (wallet.balance < service.rate_per_minute) {
    return {
      success: false,
      error: `Credito insufficiente. Per avviare questo consulto è necessario un credito di almeno ${formatCurrency(
        service.rate_per_minute,
      )}.`,
    }
  }

  // 3. Crea il record del consulto nel database
  const now = new Date().toISOString()
  const { data: consultation, error: consultationError } = await supabase
    .from("consultations")
    .insert({
      client_id: clientId,
      operator_id: operatorId,
      service_id: serviceId,
      type: type,
      status: "active",
      started_at: now,
      last_billed_at: now, // Inizializza il timestamp di fatturazione
    })
    .select("id")
    .single()

  if (consultationError) {
    console.error("Errore avvio consulto:", consultationError)
    return { success: false, error: "Errore del server: impossibile avviare il consulto." }
  }

  return { success: true, consultationId: consultation.id }
}

export async function endConsultationAction(
  consultationId: string,
  reason: "client_ended" | "operator_ended" | "insufficient_balance" | "webrtc_failed",
): Promise<{ success: boolean; error?: string }> {
  const supabase = supabaseAdmin

  const { error } = await supabase.rpc("end_consultation", {
    p_consultation_id: consultationId,
    p_reason: reason,
  })

  if (error) {
    console.error("Errore terminazione consulto:", error)
    return { success: false, error: "Impossibile terminare il consulto." }
  }

  // Invalida le cache per aggiornare le UI
  revalidatePath(`/dashboard/client/consultations`)
  revalidatePath(`/dashboard/operator/earnings`)

  return { success: true }
}
