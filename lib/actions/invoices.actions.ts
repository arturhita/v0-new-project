"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Invoice, InvoiceItem } from "@/types/invoice.types"

export async function createInvoice(
  invoiceData: Omit<Invoice, "id" | "created_at" | "total_amount"> & {
    items: Omit<InvoiceItem, "id" | "invoice_id" | "total">[]
  },
) {
  const supabase = supabaseAdmin
  const { items, ...invoice } = invoiceData

  const total_amount = items.reduce((acc, item) => acc + item.quantity * item.unit_price, 0)

  const { data: newInvoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ ...invoice, total_amount })
    .select()
    .single()

  if (invoiceError) {
    console.error("Error creating invoice:", invoiceError)
    return { error: invoiceError.message }
  }

  const invoiceItems = items.map((item) => ({
    invoice_id: newInvoice.id,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.quantity * item.unit_price,
  }))

  const { error: itemsError } = await supabase.from("invoice_items").insert(invoiceItems)

  if (itemsError) {
    console.error("Error creating invoice items:", itemsError)
    // Optionally, delete the invoice if items fail
    await supabase.from("invoices").delete().eq("id", newInvoice.id)
    return { error: itemsError.message }
  }

  return { data: newInvoice }
}

export async function getOperatorsForInvoiceCreation() {
  const supabase = supabaseAdmin
  const { data, error } = await supabase.from("profiles").select("id, full_name").eq("role", "operator")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getInvoicesForAdmin() {
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from("invoices")
    .select("*, profile:profiles(full_name)")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for admin:", error)
    return []
  }
  return data
}

export async function getInvoicesForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for operator:", error)
    return []
  }
  return data
}
