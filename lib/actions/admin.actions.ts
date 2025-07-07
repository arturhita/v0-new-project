"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/types/database"

export type OperatorWithDetails = Tables<"profiles"> & {
  operator_details: Tables<"operator_details"> | null
}

export async function approveOperator(operatorId: string) {
  console.log(`Approvazione operatore: ${operatorId}`)
  // Logica per approvare l'operatore nel database
  const { success, error } = await updateOperatorStatus(operatorId, "active")
  if (!success) {
    console.error("Error approving operator:", error)
    return { success: false, message: "Errore nell'approvazione dell'operatore." }
  }
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperator(operatorId: string, reason?: string) {
  console.log(`Rifiuto operatore: ${operatorId}, Motivo: ${reason}`)
  // Logica per rifiutare l'operatore nel database
  const { success, error } = await updateOperatorStatus(operatorId, "inactive")
  if (!success) {
    console.error("Error rejecting operator:", error)
    return { success: false, message: "Errore nel rifiuto dell'operatore." }
  }
  return { success: true, message: "Operatore rifiutato." }
}

export async function getOperators(): Promise<{ operators: OperatorWithDetails[]; error: string | null }> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, operator_details(*)")
    .eq("role", "operator")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators:", error)
    return { operators: [], error: error.message }
  }

  // The join returns an array for operator_details, so we flatten it.
  const operators = data.map((profile) => ({
    ...profile,
    operator_details: Array.isArray(profile.operator_details) ? profile.operator_details[0] : null,
  }))

  return { operators, error: null }
}

export async function updateOperatorStatus(
  userId: string,
  status: "active" | "inactive" | "suspended",
): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()
  const { error } = await supabase.from("profiles").update({ status }).eq("id", userId)

  if (error) {
    console.error("Error updating operator status:", error)
    return { success: false, error: error.message }
  }

  revalidatePath("/admin/operators")
  return { success: true, error: null }
}

export async function createOperator(formData: FormData): Promise<{ success: boolean; error: string | null }> {
  const supabase = createAdminClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const stageName = formData.get("stageName") as string

  if (!email || !password || !name || !stageName) {
    return { success: false, error: "Tutti i campi sono obbligatori." }
  }

  // 1. Create the user in auth.users
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm email for admin-created users
    user_metadata: {
      name: name,
      role: "operator",
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return { success: false, error: authError.message }
  }

  const userId = authData.user.id

  // 2. The trigger has already created the profile, now create operator_details
  const { error: detailsError } = await supabase.from("operator_details").insert({
    id: userId,
    stage_name: stageName,
    // Add other details with default values
  })

  if (detailsError) {
    console.error("Error creating operator details:", detailsError)
    // Potentially delete the auth user here for cleanup
    await supabase.auth.admin.deleteUser(userId)
    return { success: false, error: detailsError.message }
  }

  revalidatePath("/admin/operators")
  return { success: true, error: null }
}

// Altre actions per la gestione operatori (modifica commissione, profilo) possono essere aggiunte qui
