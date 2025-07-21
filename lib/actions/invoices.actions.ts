import { createAdminClient } from "../supabase/admin"

export async function getInvoices() {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.from("invoices").select("*")

    if (error) {
      console.error("Error fetching invoices:", error)
      return { data: [], error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error fetching invoices:", error)
    return { data: [], error: "Unexpected error" }
  }
}

export async function createInvoice(customer_id: string, amount: number, status: "pending" | "paid") {
  const supabaseAdmin = createAdminClient()
  try {
    const { data, error } = await supabaseAdmin.from("invoices").insert([
      {
        customer_id,
        amount,
        status,
      },
    ])

    if (error) {
      console.error("Error creating invoice:", error)
      return { data: null, error: error.message }
    }

    return { data, error: null }
  } catch (error) {
    console.error("Unexpected error creating invoice:", error)
    return { data: null, error: "Unexpected error" }
  }
}
