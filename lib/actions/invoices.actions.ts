"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Invoice {
  id: string
  invoice_number: string
  operator_id: string
  operator_name?: string
  amount: number
  tax_amount: number
  total_amount: number
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
  issue_date: string
  due_date: string
  description?: string
  created_at: string
  updated_at: string
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export async function createInvoice(invoiceData: {
  operator_id: string
  amount: number
  tax_amount: number
  description?: string
  due_date: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
}) {
  const supabase = createClient()

  try {
    // Generate invoice number
    const { count } = await supabase.from("invoices").select("*", { count: "exact", head: true })

    const invoiceNumber = `INV-${String((count || 0) + 1).padStart(6, "0")}`

    // Calculate total
    const total_amount = invoiceData.amount + invoiceData.tax_amount

    // Create invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        operator_id: invoiceData.operator_id,
        amount: invoiceData.amount,
        tax_amount: invoiceData.tax_amount,
        total_amount,
        status: "draft",
        issue_date: new Date().toISOString(),
        due_date: invoiceData.due_date,
        description: invoiceData.description,
      })
      .select()
      .single()

    if (invoiceError) throw invoiceError

    // Create invoice items
    if (invoiceData.items && invoiceData.items.length > 0) {
      const items = invoiceData.items.map((item) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.quantity * item.unit_price,
      }))

      const { error: itemsError } = await supabase.from("invoice_items").insert(items)

      if (itemsError) throw itemsError
    }

    revalidatePath("/admin/invoices")
    return { success: true, invoice }
  } catch (error) {
    console.error("Error creating invoice:", error)
    return { success: false, error: "Failed to create invoice" }
  }
}

export async function getInvoices() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        *,
        profiles!invoices_operator_id_fkey(stage_name)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data.map((invoice) => ({
      ...invoice,
      operator_name: invoice.profiles?.stage_name || "Unknown",
    }))
  } catch (error) {
    console.error("Error fetching invoices:", error)
    return []
  }
}

export async function getInvoiceById(id: string) {
  const supabase = createClient()

  try {
    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .select(`
        *,
        profiles!invoices_operator_id_fkey(stage_name, email)
      `)
      .eq("id", id)
      .single()

    if (invoiceError) throw invoiceError

    const { data: items, error: itemsError } = await supabase.from("invoice_items").select("*").eq("invoice_id", id)

    if (itemsError) throw itemsError

    return {
      ...invoice,
      operator_name: invoice.profiles?.stage_name || "Unknown",
      operator_email: invoice.profiles?.email || "",
      items: items || [],
    }
  } catch (error) {
    console.error("Error fetching invoice:", error)
    return null
  }
}

export async function updateInvoiceStatus(id: string, status: Invoice["status"]) {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("invoices")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)

    if (error) throw error

    revalidatePath("/admin/invoices")
    return { success: true }
  } catch (error) {
    console.error("Error updating invoice status:", error)
    return { success: false, error: "Failed to update invoice status" }
  }
}

export async function deleteInvoice(id: string) {
  const supabase = createClient()

  try {
    // Delete invoice items first
    await supabase.from("invoice_items").delete().eq("invoice_id", id)

    // Delete invoice
    const { error } = await supabase.from("invoices").delete().eq("id", id)

    if (error) throw error

    revalidatePath("/admin/invoices")
    return { success: true }
  } catch (error) {
    console.error("Error deleting invoice:", error)
    return { success: false, error: "Failed to delete invoice" }
  }
}

export async function getOperatorInvoices(operatorId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("operator_id", operatorId)
      .order("created_at", { ascending: false })

    if (error) throw error

    return data || []
  } catch (error) {
    console.error("Error fetching operator invoices:", error)
    return []
  }
}
