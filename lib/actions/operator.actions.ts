"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Funzione per ottenere il profilo pubblico di un operatore
export async function getOperatorPublicProfile(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "stage_name, bio, main_discipline, specialties, profile_image_url, service_prices, chat_price_per_minute, call_price_per_minute, video_price_per_minute",
    )
    .eq("id", operatorId)
    .single()

  if (error) {
    console.error("Error fetching operator public profile:", error)
    return null
  }
  return data
}

// Funzione per aggiornare il profilo pubblico di un operatore
export async function updateOperatorPublicProfile(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()

  const profileData = {
    stage_name: formData.get("stage_name") as string,
    bio: formData.get("bio") as string,
    main_discipline: formData.get("main_discipline") as string,
    specialties: (formData.get("specialties") as string).split(",").map((s) => s.trim()),
    chat_price_per_minute: Number.parseFloat(formData.get("price_chat") as string),
    call_price_per_minute: Number.parseFloat(formData.get("price_call") as string),
    video_price_per_minute: Number.parseFloat(formData.get("price_video") as string),
    updated_at: new Date().toISOString(),
  }

  // Gestione dell'immagine del profilo
  const imageFile = formData.get("profile_image") as File
  if (imageFile && imageFile.size > 0) {
    const fileName = `${operatorId}/${Date.now()}-${imageFile.name}`
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, imageFile)

    if (uploadError) {
      console.error("Error uploading profile image:", uploadError)
      return { success: false, message: "Errore durante il caricamento dell'immagine." }
    }

    const { data: publicUrlData } = supabase.storage.from("avatars").getPublicUrl(fileName)
    profileData.profile_image_url = publicUrlData.publicUrl
  }

  const { error } = await supabase.from("profiles").update(profileData).eq("id", operatorId)

  if (error) {
    console.error("Error updating operator profile:", error)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/(platform)/dashboard/operator/profile")
  return { success: true, message: "Profilo aggiornato con successo!" }
}

// Funzione per ottenere i dati della dashboard dell'operatore
export async function getOperatorDashboardData(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_operator_dashboard_data", { p_operator_id: operatorId }).single()

  if (error) {
    console.error("Error fetching operator dashboard data:", error)
    return { success: false, message: "Impossibile caricare i dati della dashboard.", data: null }
  }

  return { success: true, message: "Dati caricati.", data }
}

// Funzione per ottenere le fatture di un operatore
export async function getOperatorInvoices(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("invoices").select("*").eq("operator_id", operatorId)

  if (error) {
    console.error("Error fetching operator invoices:", error)
    return []
  }
  return data
}

// Funzione per ottenere i dettagli fiscali di un operatore
export async function getOperatorTaxDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("id", operatorId).single()

  if (error) {
    if (error.code === "PGRST116") return null // Nessuna riga trovata, non è un errore
    console.error("Error fetching tax details:", error)
    return null
  }
  return data
}

// Funzione per salvare i dettagli fiscali di un operatore
export async function saveOperatorTaxDetails(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()
  const taxData = {
    id: operatorId,
    company_name: formData.get("company_name") as string,
    vat_number: formData.get("vat_number") as string,
    tax_id: formData.get("tax_id") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    zip_code: formData.get("zip_code") as string,
    country: formData.get("country") as string,
    updated_at: new Date().toISOString(),
  }

  const { error } = await supabase.from("operator_tax_details").upsert(taxData)

  if (error) {
    console.error("Error saving tax details:", error)
    return { success: false, message: "Errore durante il salvataggio dei dati fiscali." }
  }

  revalidatePath("/(platform)/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali salvati con successo." }
}

// Funzione per ottenere l'elenco degli operatori
export async function getOperators(category?: string) {
  const supabase = createClient()
  let query = supabase.from("profiles").select("*").eq("role", "operator")

  if (category) {
    query = query.eq("main_discipline", category)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

// Funzione per ottenere un operatore dal suo nome d'arte
export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("stage_name", stageName).single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  return data
}
