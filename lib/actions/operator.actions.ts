"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { createSupabaseAdminClient } from "../supabase/admin"
import type { Profile } from "@/types/database.types"

// ============================================================================
// FUNZIONI PUBBLICHE (PER HOMEPAGE, PAGINE CATEGORIA, ECC.)
// ============================================================================

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

  const { data, error } = await query
  if (error) throw new Error(`Error fetching operators: ${error.message}`)
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

// ============================================================================
// FUNZIONI PER DASHBOARD OPERATORE
// ============================================================================

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

export async function getOperatorConsultations(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `
      id,
      created_at,
      status,
      duration_minutes,
      total_cost,
      client:profiles!client_id(full_name)
    `,
    )
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching consultations:", error)
    return []
  }
  return data
}

export async function getOperatorTaxDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("operator_id", operatorId).single()

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching tax details:", error)
  }
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

  const { error } = await supabase.from("operator_tax_details").upsert(taxData, { onConflict: "operator_id" })

  if (error) {
    console.error("Error saving tax details:", error)
    return { success: false, message: "Errore durante il salvataggio dei dati fiscali." }
  }

  revalidatePath("/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali salvati con successo." }
}

export async function getOperatorInvoices(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("operator_id", operatorId)
    .order("issue_date", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
  return data
}

// ============================================================================
// FUNZIONI PER ADMIN (GESTIONE OPERATORI)
// ============================================================================

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

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()
  if (error) throw new Error("Operatore non trovato o errore nel caricamento.")
  return data
}

export async function updateOperatorProfileByAdmin(operatorId: string, profileData: any) {
  const supabaseAdmin = await createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update(profileData).eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore durante l'aggiornamento del profilo: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/")
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

export async function suspendOperator(operatorId: string) {
  const supabaseAdmin = await createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: "suspended", is_available: false, is_online: false })
    .eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante la sospensione." }

  revalidatePath("/admin/operators")
  revalidatePath("/")
  return { success: true, message: "Operatore sospeso." }
}
