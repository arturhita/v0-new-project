"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createInvoice(invoiceData: {
  operatorId: string
  amount: number
  description: string
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    total: number
  }>
}) {
  const supabase = createAdminClient()

  try {
    // Create the invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        operator_id: invoiceData.operatorId,
        total_amount: invoiceData.amount,
        description: invoiceData.description,
        status: "pending",
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items
    const invoiceItems = invoiceData.items.map((item) => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      total: item.total,
    }))

    const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

    if (itemsError) throw itemsError

    return { success: true, invoice }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function getOperatorsForInvoiceCreation() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("id, stage_name, full_name")
    .eq("role", "operator")
    .eq("status", "Attivo")
    .order("stage_name")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data || []
}

export async function getInvoicesForAdmin() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      operator:profiles!invoices_operator_id_fkey(stage_name, full_name),
      invoice_items(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices:", error)
    return []
  }

  return data || []
}

export async function getInvoicesForOperator(operatorId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      invoice_items(*)
    `)
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator invoices:", error)
    return []
  }

  return data || []
}
