"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getInvoices() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("invoices")
    .select("*, client:client_id(email), operator:operator_id(email)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return { error: "Impossibile recuperare le fatture." }
  }
  return { data }
}

export async function createInvoice(formData: FormData) {
  const supabase = createAdminClient()

  const rawFormData = {
    recipientId: formData.get("recipientId") as string,
    amount: formData.get("amount") as string,
    dueDate: formData.get("dueDate") as string,
    description: formData.get("description") as string,
    recipientType: formData.get("recipientType") as string,
  }

  if (!rawFormData.recipientId || !rawFormData.amount || !rawFormData.dueDate || !rawFormData.recipientType) {
    return { error: "Dati mancanti per la creazione della fattura." }
  }

  const invoiceData = {
    client_id: rawFormData.recipientType === "client" ? rawFormData.recipientId : null,
    operator_id: rawFormData.recipientType === "operator" ? rawFormData.recipientId : null,
    invoice_number: `INV-${Date.now()}`,
    amount: Number.parseFloat(rawFormData.amount),
    due_date: rawFormData.dueDate,
    status: "draft",
    invoice_details: {
      items: [
        {
          description: rawFormData.description || "Fattura generata manualmente",
          amount: Number.parseFloat(rawFormData.amount),
        },
      ],
    },
  }

  const { error } = await supabase.from("invoices").insert(invoiceData)

  if (error) {
    console.error("Error creating invoice:", error)
    return { error: "Errore durante la creazione della fattura." }
  }

  revalidatePath("/admin/invoices")
  return { success: "Fattura creata con successo." }
}
