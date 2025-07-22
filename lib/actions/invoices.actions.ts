"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import createServerClient from "@/lib/supabase/server"
import type { InvoiceWithItems } from "@/types/invoice.types"

export async function createInvoice(invoiceData: any) {
  const { data, error } = await supabaseAdmin.from("invoices").insert(invoiceData).select().single()
  if (error) {
    console.error("Error creating invoice:", error)
    return { error }
  }
  return { data }
}

export async function getOperatorsForInvoiceCreation() {
  const { data, error } = await supabaseAdmin.from("profiles").select("id, full_name").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getInvoicesForAdmin(): Promise<InvoiceWithItems[]> {
  const { data, error } = await supabaseAdmin
    .from("invoices")
    .select(`
  *,
  profiles (full_name),
  invoice_items (*)
`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for admin:", error)
    return []
  }
  return data as InvoiceWithItems[]
}

export async function getInvoicesForOperator(): Promise<InvoiceWithItems[]> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("invoices")
    .select(`
  *,
  profiles (full_name),
  invoice_items (*)
`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching invoices for operator:", error)
    return []
  }
  return data as InvoiceWithItems[]
}
