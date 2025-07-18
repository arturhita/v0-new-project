"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase.from("operators").select(`
    id,
    full_name,
    email,
    phone,
    status,
    commission_rate,
    created_at
  `)

  if (error) {
    console.error("Error fetching operators for admin:", error)
    return []
  }
  return data
}

export async function getOperatorById(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operators").select("*").eq("id", operatorId).single()

  if (error) {
    console.error(`Error fetching operator by ID ${operatorId}:`, error)
    return null
  }
  return data
}

export async function updateOperatorByAdmin(operatorId: string, previousState: any, formData: FormData) {
  const supabase = createClient()

  const updates = {
    full_name: formData.get("full_name") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    status: formData.get("status") as string,
    commission_rate: Number(formData.get("commission_rate")),
    specialties: (formData.get("specialties") as string).split(",").map((s) => s.trim()),
    bio: formData.get("bio") as string,
  }

  const { error } = await supabase.from("operators").update(updates).eq("id", operatorId)

  if (error) {
    console.error("Error updating operator:", error)
    return { success: false, message: `Errore durante l'aggiornamento dell'operatore: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Operatore aggiornato con successo." }
}

export async function getPendingOperatorApplications() {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_applications").select("*").eq("status", "pending")

  if (error) {
    console.error("Error fetching pending applications:", error)
    return []
  }
  return data
}

export async function approveOperatorApplication(applicationId: string) {
  const supabase = createClient()
  const { error } = await supabase.rpc("approve_operator", { p_application_id: applicationId })

  if (error) {
    console.error("Error approving operator:", error)
    return { success: false, message: "Errore durante l'approvazione." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperatorApplication(applicationId: string, reason: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("operator_applications")
    .update({ status: "rejected", rejection_reason: reason })
    .eq("id", applicationId)

  if (error) {
    console.error("Error rejecting operator:", error)
    return { success: false, message: "Errore durante il rifiuto." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}
