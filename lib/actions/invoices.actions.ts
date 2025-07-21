"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getAllInvoices() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      total_amount,
      status,
      due_date,
      created_at,
      profiles (full_name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
  return data
}

export async function createInvoice(formData: FormData) {
  const supabaseAdmin = createAdminClient()
  // This is a simplified version. A real implementation would have more complex logic.
  const rawFormData = {
    user_id: formData.get("user_id") as string,
    total_amount: Number(formData.get("total_amount")),
    due_date: formData.get("due_date") as string,
    status: "unpaid",
  }

  const { error } = await supabaseAdmin.from("invoices").insert(rawFormData)

  if (error) {
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/invoices")
  return { success: true, message: "Fattura creata con successo." }
}
