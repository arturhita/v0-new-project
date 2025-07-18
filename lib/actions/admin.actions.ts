"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

// Punto 1 & 8: Dati reali per il cruscotto
export async function getDashboardStats() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.rpc("get_admin_dashboard_stats")
  if (error) {
    console.error("Error fetching dashboard stats:", error)
    return {
      total_users: 0,
      total_operators: 0,
      total_revenue: 0,
      pending_approvals: 0,
      pending_reviews: 0,
      open_tickets: 0,
    }
  }
  return data[0]
}

// Punto 2: Approvazioni reali
export async function getPendingOperatorApplications() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_applications").select("*").eq("status", "pending")
  if (error) {
    console.error("Error fetching pending applications:", error)
    return []
  }
  return data
}

export async function approveOperatorApplication(applicationId: string, userId: string) {
  const supabase = createAdminClient()
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ status: "Attivo", role: "operator" })
    .eq("id", userId)
  if (profileError) return { success: false, message: `Errore aggiornamento profilo: ${profileError.message}` }

  const { error: appError } = await supabase
    .from("operator_applications")
    .update({ status: "approved" })
    .eq("id", applicationId)
  if (appError) return { success: false, message: `Errore aggiornamento candidatura: ${appError.message}` }

  revalidatePath("/admin/operator-approvals")
  revalidatePath("/admin/dashboard")
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperatorApplication(applicationId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("operator_applications").update({ status: "rejected" }).eq("id", applicationId)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}

// Punto 3: Elenco operatori reale con modifiche
export async function getOperatorsForAdmin() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, full_name, stage_name, email, status, commission_rate`)
    .eq("role", "operator")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching operators for admin:", error)
    return []
  }
  return data
}

export async function getOperatorForEdit(operatorId: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", operatorId).single()
  if (error) {
    console.error(`Error fetching operator ${operatorId} for edit:`, error)
    return null
  }
  return data
}

export async function updateOperatorByAdmin(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const updates = {
    full_name: formData.get("full_name") as string,
    stage_name: formData.get("stage_name") as string,
    status: formData.get("status") as string,
    commission_rate: Number(formData.get("commission_rate")),
    bio: formData.get("bio") as string,
  }
  const { error } = await supabase.from("profiles").update(updates).eq("id", operatorId)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Operatore aggiornato con successo." }
}

// Punto 4: Elenco utenti reale
export async function getUsersForAdmin() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(`id, full_name, email, created_at`)
    .eq("role", "client")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching users for admin:", error)
    return []
  }
  return data
}

// Punto 5: Promozioni reali
export async function getPromotions() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching promotions:", error)
    return []
  }
  return data
}

export async function createPromotion(formData: FormData) {
  const supabase = createClient()
  const newPromo = {
    code: formData.get("code") as string,
    description: formData.get("description") as string,
    discount_type: formData.get("discount_type") as string,
    discount_value: Number(formData.get("discount_value")),
    start_date: formData.get("start_date") as string,
    end_date: formData.get("end_date") as string,
    is_active: (formData.get("is_active") as string) === "true",
  }
  const { error } = await supabase.from("promotions").insert(newPromo)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/promotions")
  return { success: true, message: "Promozione creata con successo." }
}

// Punto 7: Fatture reali
export async function getInvoices() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, operator:profiles(stage_name)`)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
  return data
}

// Punto 9: Recensioni reali
export async function getPendingReviews() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `*, client:profiles!reviews_user_id_fkey(full_name), operator:profiles!reviews_operator_id_fkey(stage_name)`,
    )
    .eq("status", "pending")
  if (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }
  return data
}

export async function updateReviewStatus(reviewId: string, status: "approved" | "rejected") {
  const supabase = createClient()
  const { error } = await supabase.from("reviews").update({ status }).eq("id", reviewId)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/reviews")
  return { success: true, message: `Recensione ${status === "approved" ? "approvata" : "rifiutata"}.` }
}

// Punto 10: Blog reale
export async function getBlogPosts() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching blog posts:", error)
    return []
  }
  return data
}

export async function uploadBlogImage(formData: FormData) {
  const supabase = createClient()
  const file = formData.get("image") as File
  if (!file) return { success: false, message: "Nessun file fornito." }

  const filePath = `public/${Date.now()}-${file.name}`
  const { error: uploadError } = await supabase.storage.from("blog_images").upload(filePath, file)
  if (uploadError) return { success: false, message: `Errore di caricamento: ${uploadError.message}` }

  const {
    data: { publicUrl },
  } = supabase.storage.from("blog_images").getPublicUrl(filePath)
  return { success: true, url: publicUrl }
}

export async function createBlogPost(formData: FormData) {
  const supabase = createClient()
  const newPost = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    category: formData.get("category") as string,
    image_url: formData.get("image_url") as string,
    status: formData.get("status") as string,
    published_at: formData.get("status") === "published" ? new Date().toISOString() : null,
  }
  const { error } = await supabase.from("blog_posts").insert(newPost)
  if (error) return { success: false, message: `Errore creazione post: ${error.message}` }
  revalidatePath("/admin/blog-management")
  revalidatePath("/astromag")
  revalidatePath(`/astromag/${newPost.category}`)
  return { success: true, message: "Articolo creato con successo." }
}

// Punto 11: Notifiche reali
export async function sendNotification(formData: FormData) {
  const supabase = createClient()
  const newNotification = {
    recipient_type: formData.get("recipient_type") as string,
    title: formData.get("title") as string,
    message: formData.get("message") as string,
  }
  const { error } = await supabase.from("notifications").insert(newNotification)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/notifications")
  return { success: true, message: "Notifica inviata." }
}

// Punto 12: Ticket di supporto reali
export async function getSupportTickets() {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase
    .from("support_tickets")
    .select(`*, user:profiles(full_name)`)
    .order("created_at", { ascending: false })
  if (error) {
    console.error("Error fetching tickets:", error)
    return []
  }
  return data
}

// Punto 13, 14, 15: Impostazioni reali
export async function getSettings(key: string) {
  noStore()
  const supabase = createClient()
  const { data, error } = await supabase.from("platform_settings").select("settings").eq("id", key).single()
  if (error || !data) return {}
  return data.settings
}

export async function saveSettings(key: string, settings: any) {
  const supabase = createClient()
  const { error } = await supabase.from("platform_settings").upsert({ id: key, settings })
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath(`/admin/settings/${key === "companyDetails" ? "company-details" : "legal"}`)
  return { success: true, message: "Impostazioni salvate." }
}
