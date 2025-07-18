"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"
import { v4 as uuid_generate_v4 } from "uuid"

const supabase = createClient()
const supabaseAdmin = createAdminClient()

// PUNTO 1: Cruscotto con dati reali
export async function getDashboardStats() {
  noStore()
  const { count: totalOperators } = await supabase
    .from("profiles")
    .select("id", { count: "exact" })
    .eq("role", "operator")
  const { count: totalClients } = await supabase.from("profiles").select("id", { count: "exact" }).eq("role", "client")
  const { count: pendingApprovals } = await supabase
    .from("operator_applications")
    .select("id", { count: "exact" })
    .eq("status", "pending")
  const { count: openTickets } = await supabase
    .from("support_tickets")
    .select("id", { count: "exact" })
    .eq("status", "open")

  // Dati finanziari (esempio, da adattare con le tabelle reali delle transazioni)
  const { data: monthlyRevenueData, error } = await supabase.rpc("get_monthly_revenue")

  return {
    totalOperators: totalOperators ?? 0,
    totalClients: totalClients ?? 0,
    pendingApprovals: pendingApprovals ?? 0,
    openTickets: openTickets ?? 0,
    monthlyRevenue: monthlyRevenueData?.[0]?.total_revenue ?? 0,
    // Aggiungere altre statistiche reali qui
  }
}

// PUNTO 2: Approvazioni reali
export async function getPendingOperatorApplications() {
  noStore()
  const { data, error } = await supabase.from("operator_applications").select("*").eq("status", "pending")
  if (error) {
    console.error("Error fetching pending applications:", error)
    return []
  }
  return data
}

export async function approveOperatorApplication(applicationId: string) {
  const { error } = await supabase.rpc("approve_operator", { p_application_id: applicationId })
  if (error) {
    return { success: false, message: `Errore approvazione: ${error.message}` }
  }
  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperatorApplication(applicationId: string) {
  const { error } = await supabase.from("operator_applications").update({ status: "rejected" }).eq("id", applicationId)
  if (error) {
    return { success: false, message: `Errore nel rifiutare la candidatura: ${error.message}` }
  }
  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}

// PUNTO 3: Gestione Operatori Reale
export async function getOperatorForEdit(operatorId: string) {
  noStore()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", operatorId).single()

  if (error) {
    console.error(`Error fetching operator for edit: ${error.message}`)
    return null
  }
  return data
}

export async function updateOperatorByAdmin(operatorId: string, formData: FormData) {
  const updates = {
    full_name: formData.get("full_name") as string,
    stage_name: formData.get("stage_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    status: formData.get("status") as string,
    commission_rate: Number(formData.get("commission_rate")),
    bio: formData.get("bio") as string,
  }

  const { error } = await supabase.from("profiles").update(updates).eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore durante l'aggiornamento: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Operatore aggiornato con successo." }
}

// PUNTO 4: Gestione Utenti Reale
export async function getAllUsers() {
  noStore()
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching users:", error)
    return []
  }
  return data
}

// PUNTO 5: Promozioni Reali
export async function getPromotions() {
  noStore()
  const { data, error } = await supabase.from("promotions").select("*")
  if (error) return []
  return data
}

export async function createPromotion(formData: FormData) {
  const newPromo = {
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    discount_type: formData.get("discount_type") as "percentage" | "fixed_amount",
    value: Number(formData.get("value")),
    start_date: new Date(formData.get("start_date") as string).toISOString(),
    end_date: formData.get("end_date") ? new Date(formData.get("end_date") as string).toISOString() : null,
    is_active: formData.get("is_active") === "on",
  }
  const { error } = await supabase.from("promotions").insert(newPromo)
  if (error) return { success: false, message: error.message }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata." }
}

// PUNTO 7: Fatture Reali
export async function getInvoices() {
  noStore()
  const { data, error } = await supabase.from("invoices").select(`
            *,
            client:user_id ( full_name, email ),
            operator:operator_id ( stage_name )
        `)
  if (error) {
    console.error("ERRORE RECUPERO FATTURE:", error.message)
    return []
  }
  return data
}

// PUNTO 10: Gestione Blog Reale
export async function createBlogPost(formData: FormData) {
  const newPost = {
    title: formData.get("title") as string,
    slug: (formData.get("title") as string).toLowerCase().replace(/\s+/g, "-"),
    content: JSON.parse(formData.get("content") as string),
    category: formData.get("category") as string,
    status: formData.get("status") as "draft" | "published",
    cover_image_url: formData.get("cover_image_url") as string,
    published_at: formData.get("status") === "published" ? new Date().toISOString() : null,
  }
  const { error } = await supabase.from("blog_posts").insert(newPost)
  if (error) return { success: false, message: error.message }
  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  return { success: true, message: "Articolo creato." }
}

export async function uploadBlogImage(file: File) {
  const fileName = `${uuid_generate_v4()}-${file.name}`
  const { data, error } = await supabase.storage.from("blog_images").upload(fileName, file)
  if (error) return { success: false, url: null, message: error.message }

  const {
    data: { publicUrl },
  } = supabase.storage.from("blog_images").getPublicUrl(fileName)
  return { success: true, url: publicUrl, message: "Immagine caricata." }
}

// PUNTO 13 & 14: Impostazioni Reali
export async function getCompanySettings() {
  noStore()
  const { data, error } = await supabase.from("company_settings").select("*").single()
  if (error) return null
  return data
}

export async function updateCompanySettings(formData: FormData) {
  const updates = {
    company_name: formData.get("company_name") as string,
    vat_number: formData.get("vat_number") as string,
    address: formData.get("address") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
  }
  const { error } = await supabase
    .from("company_settings")
    .update(updates)
    .eq("id", "00000000-0000-0000-0000-000000000001") // ID fisso
  if (error) return { success: false, message: error.message }
  revalidatePath("/admin/company-details")
  return { success: true, message: "Dati aziendali salvati." }
}
