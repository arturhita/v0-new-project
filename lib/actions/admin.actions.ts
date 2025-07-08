"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveOperator(formData: FormData) {
  const userId = formData.get("userId") as string
  if (!userId) return

  const supabase = createClient()

  // 1. Aggiorna lo stato in operator_details
  const { error: detailsError } = await supabase
    .from("operator_details")
    .update({ status: "approved" })
    .eq("user_id", userId)

  if (detailsError) {
    console.error("Error approving operator details:", detailsError)
    return { error: detailsError.message }
  }

  // 2. Aggiorna il ruolo in profiles
  const { error: profileError } = await supabase.from("profiles").update({ role: "operator" }).eq("id", userId)

  if (profileError) {
    console.error("Error updating profile role:", profileError)
    // Potremmo voler gestire un rollback qui in un'app di produzione
    return { error: profileError.message }
  }

  revalidatePath("/admin/operator-approvals")
  revalidatePath("/esperti") // Invalida la cache delle pagine pubbliche
  revalidatePath("/")
}

export async function rejectOperator(formData: FormData) {
  const userId = formData.get("userId") as string
  if (!userId) return

  const supabase = createClient()

  const { error } = await supabase.from("operator_details").update({ status: "rejected" }).eq("user_id", userId)

  if (error) {
    console.error("Error rejecting operator:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/operator-approvals")
}
