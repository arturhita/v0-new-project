"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface PlatformSettings {
  call_deductions: {
    enabled: boolean
    user_fixed_deduction: number
    operator_fixed_deduction: number
  }
  payment_processing: {
    operator_fixed_fee: number
    enabled: boolean
  }
  operator_deductions: {
    enabled: boolean
    fixed_deduction: number
  }
}

// Recupera le impostazioni
export async function getPlatformSettings(): Promise<PlatformSettings> {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("platform_settings").select("settings").eq("id", "singleton").single()

  if (error || !data) {
    console.error("Error fetching platform settings:", error)
    // Ritorna un default di sicurezza
    return {
      call_deductions: { enabled: false, user_fixed_deduction: 0, operator_fixed_deduction: 0 },
      payment_processing: { enabled: false, operator_fixed_fee: 0 },
      operator_deductions: { enabled: false, fixed_deduction: 0 },
    }
  }
  return data.settings as PlatformSettings
}

// Salva le impostazioni
export async function savePlatformSettings(settings: PlatformSettings) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("platform_settings")
    .update({ settings, updated_at: new Date().toISOString() })
    .eq("id", "singleton")

  if (error) {
    return { success: false, message: "Errore nel salvataggio delle impostazioni." }
  }

  revalidatePath("/admin/settings/advanced")
  return { success: true, message: "Impostazioni salvate con successo." }
}

// Recupera le richieste di commissione pendenti
export async function getPendingCommissionRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select(
      `
      id,
      operator_id,
      current_commission,
      requested_commission,
      justification,
      created_at,
      operator_profiles (
        display_name
      )
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  // Trasformiamo i dati per renderli più facili da usare nel componente
  return data.map((req) => ({
    ...req,
    operatorName: req.operator_profiles?.display_name || "Nome non disponibile",
  }))
}

// Crea una richiesta di commissione (lato operatore)
export async function createCommissionRequest(
  operatorId: string,
  currentCommission: number,
  requestedCommission: number,
  justification: string,
) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("commission_requests").insert({
    operator_id: operatorId,
    current_commission: currentCommission,
    requested_commission: requestedCommission,
    justification: justification,
  })

  if (error) {
    return { success: false, message: "Errore nell'invio della richiesta." }
  }

  revalidatePath("/admin/settings/advanced")
  revalidatePath("/(platform)/dashboard/operator/commission-request")
  return { success: true, message: "Richiesta inviata con successo." }
}

// Gestisce una richiesta (approva o rifiuta)
export async function resolveCommissionRequest(requestId: string, approved: boolean, adminUserId: string) {
  const supabase = createAdminClient()

  // 1. Recupera la richiesta
  const { data: request, error: fetchError } = await supabase
    .from("commission_requests")
    .select("operator_id, requested_commission")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, message: "Richiesta non trovata." }
  }

  // 2. Se approvata, aggiorna la commissione dell'operatore
  if (approved) {
    const { error: updateError } = await supabase
      .from("operator_profiles")
      .update({ commission_rate: request.requested_commission })
      .eq("user_id", request.operator_id)

    if (updateError) {
      return { success: false, message: "Errore nell'aggiornamento del profilo operatore." }
    }
  }

  // 3. Aggiorna lo stato della richiesta
  const newStatus = approved ? "approved" : "rejected"
  const { error: statusError } = await supabase
    .from("commission_requests")
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
      resolved_by: adminUserId,
    })
    .eq("id", requestId)

  if (statusError) {
    // Potremmo voler implementare un rollback qui in un'app di produzione
    return { success: false, message: "Errore nell'aggiornamento dello stato della richiesta." }
  }

  revalidatePath("/admin/settings/advanced")
  return { success: true, message: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
