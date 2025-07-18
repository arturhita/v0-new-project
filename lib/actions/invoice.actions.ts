"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getInvoices() {
  const supabase = createClient()
  const { data, error } = await supabase.from("invoices").select(`
    *,
    operators (
      full_name
    )
  `)

  if (error) {
    console.error("Error fetching invoices:", error)
    // Return empty array instead of throwing to prevent page crash
    return []
  }

  // Map the data to a flatter structure for the client
  return data.map((invoice) => ({
    ...invoice,
    operator_name: invoice.operators?.full_name || "N/A",
  }))
}

export async function createInvoice(formData: FormData) {
  const supabase = createClient()

  const newInvoice = {
    operator_id: formData.get("operator_id") as string,
    amount: Number(formData.get("amount")),
    due_date: formData.get("due_date") as string,
    status: formData.get("status") as "pending" | "paid" | "overdue",
    description: formData.get("description") as string,
  }

  const { error } = await supabase.from("invoices").insert(newInvoice)

  if (error) {
    console.error("Error creating invoice:", error)
    return { success: false, message: "Errore durante la creazione della fattura." }
  }

  revalidatePath("/admin/invoices")
  return { success: true, message: "Fattura creata con successo." }
}
