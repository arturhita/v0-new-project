"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"
import type { Profile } from "@/types/database.types"

// Funzioni pubbliche
export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `
      id, stage_name, bio, is_available, is_online, profile_image_url, 
      average_rating, review_count, main_discipline, specialties,
      categories ( name, slug )
      `,
    )
    .eq("role", "operator")
    .eq("status", "Attivo")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  query = query
    .order("is_online", { ascending: false })
    .order("average_rating", { ascending: false, nullsFirst: false })

  const { data, error } = await query
  if (error) throw new Error(`Error fetching operators: ${error.message}`)
  return (data as Profile[]) || []
}

export async function getOperatorByStageName(stageName: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`*, categories ( name, slug ), stories ( id, media_url, media_type, expires_at )`)
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .gt("stories.expires_at", new Date().toISOString()) // Prende solo storie attive
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  return data
}

// Funzioni Dashboard Operatore
export async function updateOperatorStatus(operatorId: string, isAvailable: boolean) {
  const supabase = createClient()
  const { error } = await supabase.from("profiles").update({ is_available: isAvailable }).eq("id", operatorId)
  if (error) return { success: false, message: "Impossibile aggiornare lo stato." }
  revalidatePath("/dashboard/operator")
  return { success: true }
}

export async function getOperatorPublicProfile(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("stage_name, bio, main_discipline, specialties, profile_image_url, service_prices")
    .eq("id", operatorId)
    .single()
  if (error) return null
  return data
}

export async function updateOperatorPublicProfile(operatorId: string, prevState: any, formData: FormData) {
  const supabase = createClient()
  const profileImage = formData.get("profile_image") as File
  let profileImageUrl = formData.get("current_image_url") as string

  if (profileImage && profileImage.size > 0) {
    const fileExtension = profileImage.name.split(".").pop()
    const fileName = `${operatorId}/${uuidv4()}.${fileExtension}`
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, profileImage, { upsert: true })
    if (uploadError) return { success: false, message: "Errore durante il caricamento dell'immagine." }
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName)
    profileImageUrl = data.publicUrl
  }

  const profileData = {
    stage_name: formData.get("stage_name") as string,
    bio: formData.get("bio") as string,
    main_discipline: formData.get("main_discipline") as string,
    specialties: (formData.get("specialties") as string).split(",").map((s) => s.trim()),
    service_prices: {
      chat: Number(formData.get("price_chat") as string) || 0,
      call: Number(formData.get("price_call") as string) || 0,
      video: Number(formData.get("price_video") as string) || 0,
    },
    profile_image_url: profileImageUrl,
  }

  const { error } = await supabase.from("profiles").update(profileData).eq("id", operatorId)
  if (error) return { success: false, message: `Errore: ${error.message}` }

  revalidatePath("/dashboard/operator/profile")
  revalidatePath(`/operator/${profileData.stage_name}`)
  return { success: true, message: "Profilo aggiornato!" }
}

export async function getOperatorTaxDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("operator_id", operatorId).single()
  if (error && error.code !== "PGRST116") console.error("Error fetching tax details:", error)
  return data
}

export async function saveOperatorTaxDetails(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const taxData = {
    operator_id: operatorId,
    tax_id: formData.get("tax_id") as string,
    vat_number: formData.get("vat_number") as string,
    company_name: formData.get("company_name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    zip_code: formData.get("zip_code") as string,
    country: formData.get("country") as string,
  }
  const { error } = await supabase.from("operator_tax_details").upsert(taxData)
  if (error) return { success: false, message: "Errore salvataggio dati fiscali." }
  revalidatePath("/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali salvati." }
}

export async function getOperatorInvoices(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("operator_id", operatorId)
    .order("issue_date", { ascending: false })
  if (error) return []
  // Mock data if empty for display
  if (!data || data.length === 0) {
    return [
      {
        id: "123",
        invoice_number: "INV-2024-001",
        issue_date: new Date().toISOString(),
        amount: 150.0,
        status: "paid",
        pdf_url: "#",
      },
    ]
  }
  return data.map((i) => ({ ...i, date: i.issue_date, amount: i.amount ?? 0 }))
}
