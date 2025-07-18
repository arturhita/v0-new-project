"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export interface InvoiceData {
  clientId: string
  operatorId: string
  amount: number
  dueDate: string
  details: Record<string, any>
}

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
      client:client_id (
        id,
        raw_user_meta_data->>full_name
      ),
      operator:operator_id (
        id,
        raw_user_meta_data->>full_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }

  return data.map((inv) => ({
    ...inv,
    clientName: inv.client?.full_name || "N/A",
    operatorName: inv.operator?.full_name || "N/A",
  }))
}

export async function createInvoice(invoiceData: InvoiceData) {
  const supabase = createAdminClient()

  const invoiceNumber = `INV-${Date.now()}`

  const { error } = await supabase.from("invoices").insert({
    client_id: invoiceData.clientId,
    operator_id: invoiceData.operatorId,
    amount: invoiceData.amount,
    due_date: invoiceData.dueDate,
    invoice_details: invoiceData.details,
    invoice_number: invoiceNumber,
    status: "draft",
  })

  if (error) {
    console.error("Error creating invoice:", error)
    return { success: false, message: "Errore nella creazione della fattura." }
  }

  revalidatePath("/admin/invoices")
  return { success: true, message: "Fattura creata con successo.", invoiceId: invoiceNumber }
}
