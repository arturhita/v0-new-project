"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveOperator(applicationId: string, userId: string) {
  const supabase = createSupabaseServerClient()

  const { error: updateError } = await supabase
    .from("operator_applications")
    .update({ status: "Approved" })
    .eq("id", applicationId)

  if (updateError) {
    console.error("Error approving operator application:", updateError)
    return { success: false, message: "Failed to approve operator application." }
  }

  const { error: roleError } = await supabase.from("profiles").update({ role: "operator" }).eq("id", userId)

  if (roleError) {
    console.error("Error updating user role:", roleError)
    // Rollback application status
    await supabase.from("operator_applications").update({ status: "Pending" }).eq("id", applicationId)
    return { success: false, message: "Failed to update user role." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operator approved successfully." }
}

export async function rejectOperator(applicationId: string) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.from("operator_applications").update({ status: "Rejected" }).eq("id", applicationId)

  if (error) {
    console.error("Error rejecting operator application:", error)
    return { success: false, message: "Failed to reject operator application." }
  }

  revalidatePath("/admin/operator-approvals")
  return { success: true, message: "Operator rejected successfully." }
}
