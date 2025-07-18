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

export interface CompanyDetails {
  companyName: string
  vatNumber: string
  address: string
  phone: string
  email: string
}

// Recupera le impostazioni complete (piattaforma + azienda)
export async function getFullPlatformSettings(): Promise<{ platform: PlatformSettings; company: CompanyDetails }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("platform_settings")
    .select("settings, company_details")
    .eq("id", "singleton")
    .single()

  const defaultSettings = {
    platform: {
      call_deductions: { enabled: false, user_fixed_deduction: 0, operator_fixed_deduction: 0 },
      payment_processing: { enabled: false, operator_fixed_fee: 0 },
      operator_deductions: { enabled: false, fixed_deduction: 0 },
    },
    company: {
      companyName: "",
      vatNumber: "",
      address: "",
      phone: "",
      email: "",
    },
  }

  if (error || !data) {
    console.error("Error fetching platform settings:", error)
    return defaultSettings
  }

  return {
    platform: (data.settings as PlatformSettings) || defaultSettings.platform,
    company: (data.company_details as CompanyDetails) || defaultSettings.company,
  }
}

// Salva le impostazioni della piattaforma
export async function savePlatformSettings(settings: PlatformSettings) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("platform_settings")
    .update({ settings, updated_at: new Date().toISOString() })
    .eq("id", "singleton")

  if (error) {
    console.error("Error saving platform settings:", error)
    return { success: false, message: "Errore nel salvataggio delle impostazioni." }
  }

  revalidatePath("/admin/settings/advanced")
  return { success: true, message: "Impostazioni piattaforma salvate con successo." }
}

// Salva i dettagli dell'azienda
export async function saveCompanyDetails(details: CompanyDetails) {
  const supabase = createAdminClient()
  const { error } = await supabase
    .from("platform_settings")
    .update({ company_details: details, updated_at: new Date().toISOString() })
    .eq("id", "singleton")

  if (error) {
    console.error("Errore salvataggio dettagli azienda:", error)
    return { success: false, message: "Errore nel salvataggio dei dettagli azienda." }
  }

  revalidatePath("/admin/company-details")
  return { success: true, message: "Dettagli azienda salvati con successo." }
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
  return data.map((req) => ({
    ...req,
    operatorName: req.operator_profiles?.display_name || "Nome non disponibile",
  }))
}

// Gestisce una richiesta (approva o rifiuta)
export async function resolveCommissionRequest(requestId: string, approved: boolean, adminUserId: string) {
  const supabase = createAdminClient()

  const { data: request, error: fetchError } = await supabase
    .from("commission_requests")
    .select("operator_id, requested_commission")
    .eq("id", requestId)
    .single()

  if (fetchError || !request) {
    return { success: false, message: "Richiesta non trovata." }
  }

  if (approved) {
    const { error: updateError } = await supabase
      .from("operator_profiles")
      .update({ commission_rate: request.requested_commission })
      .eq("user_id", request.operator_id)

    if (updateError) {
      return { success: false, message: "Errore nell'aggiornamento del profilo operatore." }
    }
  }

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
    return { success: false, message: "Errore nell'aggiornamento dello stato della richiesta." }
  }

  revalidatePath("/admin/settings/advanced")
  revalidatePath("/admin/operators")
  return { success: true, message: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
