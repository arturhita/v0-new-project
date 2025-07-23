"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createInvoice(invoiceData: any) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("invoices").insert([invoiceData]).select()
  if (error) {
    console.error("Error creating invoice:", error)
    return { success: false, error }
  }
  return { success: true, data }
}

export async function getOperatorsForInvoiceCreation() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("profiles").select("id, full_name").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getInvoicesForAdmin() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("invoices").select("*, profiles(full_name)")
  if (error) {
    console.error("Error fetching invoices for admin:", error)
    return []
  }
  return data
}

export async function getInvoicesForOperator(operatorId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("invoices").select("*").eq("user_id", operatorId)
  if (error) {
    console.error("Error fetching invoices for operator:", error)
    return []
  }
  return data
}
