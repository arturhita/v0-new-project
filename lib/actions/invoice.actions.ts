"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Interfaccia per i dati della fattura
interface InvoiceData {
  userId: string
  operatorId?: string
  amount: number
  dueDate: string
  details: any // JSON object for line items
}

// Crea una fattura
export async function createInvoice(invoiceData: InvoiceData) {
  const supabase = createAdminClient()

  const invoiceNumber = `INV-${Date.now()}`

  const { error } = await supabase.from("invoices").insert({
    invoice_number: invoiceNumber,
    user_id: invoiceData.userId,
    operator_id: invoiceData.operatorId,
    amount: invoiceData.amount,
    due_date: invoiceData.dueDate,
    invoice_details: invoiceData.details,
    status: "pending",
  })

  if (error) {
    console.error("Errore creazione fattura:", error)
    return {
      success: false,
      message: "Errore nella creazione della fattura.",
    }
  }

  revalidatePath("/admin/invoices")
  if (invoiceData.operatorId) {
    revalidatePath(`/(platform)/dashboard/operator/invoices`)
  }
  if (invoiceData.userId) {
    revalidatePath(`/(platform)/dashboard/client/invoices`) // Assuming clients can have invoices
  }

  return {
    success: true,
    message: "Fattura creata con successo.",
    invoiceId: invoiceNumber,
  }
}

// Recupera tutte le fatture (per admin)
export async function getAllInvoices() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
            id,
            invoice_number,
            amount,
            status,
            due_date,
            user:user_id ( email ),
            operator:operator_id ( email )
        `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }

  return data.map((inv) => ({
    ...inv,
    user_email: inv.user?.email || "N/A",
    operator_email: inv.operator?.email || "N/A",
  }))
}
