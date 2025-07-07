"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Tables } from "@/types/database"

export type OperatorWithDetails = Tables<"profiles"> & {
  operator_details: Tables<"operator_details"> | null
}

export async function approveOperator(operatorId: string) {
  console.log(`Approvazione operatore: ${operatorId}`)
  const { success, error } = await updateOperatorStatus(operatorId, "active")
  if (!success) {
    console.error("Error approving operator:", error)
    return { success: false, message: "Errore nell'approvazione dell'operatore." }
  }
  revalidatePath("/admin/operator-approvals")
  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperator(operatorId: string, reason?: string) {
  console.log(`Rifiuto operatore: ${operatorId}, Motivo: ${reason}`)
  const { success, error } = await updateOperatorStatus(operatorId, "inactive")
  if (!success) {
    console.error("Error rejecting operator:", error)
    return { success: false, message: "Errore nel rifiuto dell'operatore." }
  }
  revalidatePath("/admin/operator-approvals")
  revalidatePath("/admin/operators")
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

  const operators = data.map((profile) => ({
    ...profile,
    operator_details:
      Array.isArray(profile.operator_details) && profile.operator_details.length > 0
        ? profile.operator_details[0]
        : null,
  }))

  return { operators, error: null }
}

export async function updateOperatorStatus(
  userId: string,
  status: "active" | "inactive" | "suspended" | "pending_approval",
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

  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      name,
      role: "operator",
      stage_name: stageName,
    },
  })

  if (authError) {
    console.error("Error creating auth user:", authError)
    return { success: false, error: authError.message }
  }

  revalidatePath("/admin/operators")
  return { success: true, error: null }
}
