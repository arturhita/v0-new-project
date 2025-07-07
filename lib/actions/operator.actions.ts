"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import type { Profile } from "@/types/database.types"

/**
 * FUNZIONE RIPRISTINATA E OTTIMIZZATA
 * Ora chiama la funzione SQL 'get_operator_dashboard_data' per massima efficienza.
 */
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

export async function getAllOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_operators_view")
    .select("*")
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators for admin:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }
  return data
}

export async function getCategoriesForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase.from("categories").select("name").order("name", { ascending: true })

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }
  return data.map((c) => c.name)
}

export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `
      id, 
      full_name, 
      stage_name, 
      bio, 
      is_available, 
      is_online, 
      profile_image_url, 
      service_prices, 
      average_rating, 
      review_count, 
      main_discipline,
      specialties,
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

  const { data, error: queryError } = await query
  if (queryError) throw new Error(`Error fetching operators: ${queryError.message}`)
  if (!data) return []

  return data as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
      id, 
      full_name, 
      stage_name, 
      bio, 
      is_available, 
      is_online, 
      profile_image_url, 
      service_prices, 
      average_rating, 
      review_count, 
      status, 
      main_discipline,
      specialties,
      categories ( name, slug )
      `,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  if (!data) return null

  return data as Profile
}

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()
  if (error) throw new Error("Operatore non trovato o errore nel caricamento.")
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update(profileData).eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore durante l'aggiornamento del profilo: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/")
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

export async function updateOperatorCommission(operatorId: string, commission: number) {
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante l'aggiornamento della commissione." }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

export async function suspendOperator(operatorId: string) {
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: "suspended", is_available: false, is_online: false })
    .eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante la sospensione." }

  revalidatePath("/admin/operators")
  revalidatePath("/")
  return { success: true, message: "Operatore sospeso." }
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

  // TODO: Aggiungere validazione con Zod

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
