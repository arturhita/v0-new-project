"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getInvoices() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      amount,
      status,
      due_date,
      created_at,
      client:profiles!client_id (full_name),
      operator:profiles!operator_id (full_name)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return { error: "Impossibile recuperare le fatture." }
  }
  return { data }
}

export async function createInvoice(formData: FormData) {
  const supabase = createAdminClient()

  const rawData = {
    client_id: formData.get("client_id") as string,
    operator_id: formData.get("operator_id") as string,
    amount: Number(formData.get("amount")),
    due_date: formData.get("due_date") as string,
    description: formData.get("description") as string,
  }

  // Semplice validazione lato server
  if (!rawData.client_id || !rawData.operator_id || !rawData.amount || !rawData.due_date) {
    return { success: false, message: "Tutti i campi sono obbligatori." }
  }

  const { error } = await supabase.from("invoices").insert([
    {
      ...rawData,
      status: "pending", // Le nuove fatture sono sempre pendenti
      invoice_number: `INV-${Date.now()}`, // Genera un numero di fattura univoco
    },
  ])

  if (error) {
    console.error("Error creating invoice:", error)
    return { success: false, message: "Errore durante la creazione della fattura." }
  }

  revalidatePath("/admin/invoices")
  return { success: true, message: "Fattura creata con successo." }
}

export async function updateInvoiceStatus(invoiceId: string, status: "pending" | "paid" | "cancelled") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("invoices").update({ status }).eq("id", invoiceId)

  if (error) {
    return { success: false, message: "Errore durante l'aggiornamento dello stato." }
  }

  revalidatePath("/admin/invoices")
  return { success: true }
}
