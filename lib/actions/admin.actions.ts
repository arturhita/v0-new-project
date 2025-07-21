"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getPendingOperatorApplications() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin.from("operator_applications").select("*").eq("status", "pending")

  if (error) {
    console.error("Error fetching pending applications:", error)
    return []
  }
  return data
}

export async function approveOperatorApplication(applicationId: string, userId: string) {
  const supabaseAdmin = createAdminClient()
  const { error: updateError } = await supabaseAdmin
    .from("operator_applications")
    .update({ status: "approved" })
    .eq("id", applicationId)

  if (updateError) {
    console.error("Error approving application:", updateError)
    return { success: false, message: updateError.message }
  }

  const { error: roleError } = await supabaseAdmin.from("profiles").update({ role: "operator" }).eq("id", userId)

  if (roleError) {
    console.error("Error updating user role:", roleError)
    // Potentially rollback application status update here
    return { success: false, message: roleError.message }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operatore approvato con successo." }
}

export async function rejectOperatorApplication(applicationId: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin
    .from("operator_applications")
    .update({ status: "rejected" })
    .eq("id", applicationId)

  if (error) {
    console.error("Error rejecting application:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Candidatura rifiutata." }
}
