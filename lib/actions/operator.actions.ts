"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorConsultations(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `
      id,
      created_at,
      status,
      duration_minutes,
      total_cost,
      client:profiles!client_id(full_name)
    `,
    )
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching consultations:", error)
    return []
  }
  return data
}

export async function getOperatorTaxDetails(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("operator_tax_details").select("*").eq("operator_id", operatorId).single()

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows found, which is not an error here
    console.error("Error fetching tax details:", error)
  }
  return data
}

export async function saveOperatorTaxDetails(operatorId: string, formData: FormData) {
  const supabase = createClient()
  const taxData = {
    operator_id: operatorId,
    tax_id: formData.get("tax_id") as string,
    vat_number: formData.get("vat_number") as string,
    company_name: formData.get("company_name") as string,
    address: formData.get("address") as string,
    city: formData.get("city") as string,
    zip_code: formData.get("zip_code") as string,
    country: formData.get("country") as string,
  }

  const { error } = await supabase.from("operator_tax_details").upsert(taxData, { onConflict: "operator_id" })

  if (error) {
    console.error("Error saving tax details:", error)
    return { success: false, message: "Errore durante il salvataggio dei dati fiscali." }
  }

  revalidatePath("/dashboard/operator/tax-info")
  return { success: true, message: "Dati fiscali salvati con successo." }
}

export async function getOperatorInvoices(operatorId: string) {
  // This is a mock function for now, as invoice generation is complex.
  // In a real scenario, this would query an 'invoices' table.
  return [
    { id: "INV-001", date: "2023-10-01", amount: 150.0, status: "paid" },
    { id: "INV-002", date: "2023-11-01", amount: 250.5, status: "paid" },
    { id: "INV-003", date: "2023-12-01", amount: 180.75, status: "pending" },
  ]
}
