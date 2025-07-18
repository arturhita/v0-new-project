"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getInvoices() {
  const supabase = createClient()
  const { data, error } = await supabase.from("invoices").select(`*, operator:profiles!operator_id(full_name)`)
  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
  return data.map((inv) => ({ ...inv, operator_name: inv.operator?.full_name || "N/A" }))
}

export async function createInvoice(formData: FormData) {
  const supabase = createClient()
  const newInvoice = {
    operator_id: formData.get("operator_id") as string,
    amount: Number(formData.get("amount")),
    due_date: formData.get("due_date") as string,
    status: "pending",
    description: formData.get("description") as string,
  }
  const { error } = await supabase.from("invoices").insert(newInvoice)
  if (error) return { success: false, message: `Errore: ${error.message}` }
  revalidatePath("/admin/invoices")
  return { success: true, message: "Fattura creata." }
}
