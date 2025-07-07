"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function getOperatorDashboardData(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_dashboard_data", { operator_id_param: operatorId }).single()

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return { success: false, message: "Impossibile caricare i dati della dashboard." }
  }

  return {
    success: true,
    data: {
      monthlyEarnings: data.monthly_earnings,
      consultationsCount: data.consultations_count,
      unreadMessagesCount: data.unread_messages_count,
    },
  }
}

export async function getOperatorPublicProfile(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      stage_name,
      bio,
      main_discipline,
      specialties,
      profile_image_url,
      service_prices
    `,
    )
    .eq("id", operatorId)
    .single()

  if (error) {
    console.error("Error fetching operator profile for edit:", error)
    return null
  }
  return data
}

export async function updateOperatorPublicProfile(operatorId: string, formData: FormData) {
  const supabase = createClient()

  const profileData = {
    stage_name: formData.get("stage_name") as string,
    bio: formData.get("bio") as string,
    main_discipline: formData.get("main_discipline") as string,
    specialties: (formData.get("specialties") as string).split(",").map((s) => s.trim()),
    service_prices: {
      chat: Number.parseFloat(formData.get("price_chat") as string),
      call: Number.parseFloat(formData.get("price_call") as string),
      video: Number.parseFloat(formData.get("price_video") as string),
    },
  }

  const { error } = await supabase.from("profiles").update(profileData).eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore: ${error.message}` }
  }

  revalidatePath("/dashboard/operator/profile")
  revalidatePath(`/operator/${profileData.stage_name}`)
  return { success: true, message: "Profilo aggiornato con successo!" }
}

export async function updateOperatorStatus(operatorId: string, isAvailable: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from("profiles").update({ is_available: isAvailable }).eq("id", operatorId)

  if (error) {
    console.error("Error updating operator status:", error)
    return { success: false, message: "Impossibile aggiornare lo stato." }
  }

  revalidatePath("/dashboard/operator")
  return { success: true }
}

// NUOVA AZIONE PER SALVARE I DATI FISCALI
export async function saveOperatorTaxDetails(operatorId: string, formData: FormData) {
  const supabase = createClient()

  const taxData = {
    operator_id: operatorId,
    tax_id: formData.get("tax_id") as string,
    vat_id: formData.get("vat_id") as string,
    company_name: formData.get("company_name") as string,
    full_address: formData.get("full_address") as string,
    pec_email: formData.get("pec_email") as string,
    sdi_code: formData.get("sdi_code") as string,
  }

  // Upsert: crea se non esiste, altrimenti aggiorna
  const { error } = await supabase.from("operator_tax_details").upsert(taxData, { onConflict: "operator_id" })

  if (error) {
    console.error("Error saving tax details:", error)
    return { success: false, message: `Errore nel salvataggio dei dati fiscali: ${error.message}` }
  }

  revalidatePath("/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali salvati con successo." }
}

// NUOVA AZIONE PER LEGGERE I DATI FISCALI (per pre-compilare il form)
export async function getOperatorTaxDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("operator_id", operatorId).single()

  // Non trattare "not found" come un errore, è normale per un nuovo utente
  if (error && error.code !== "PGRST116") {
    console.error("Error fetching tax details:", error)
    return null
  }

  return data
}
