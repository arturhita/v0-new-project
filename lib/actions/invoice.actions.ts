"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createInvoice(formData: FormData) {
  const supabase = createClient()

  const operatorId = formData.get("operator_id") as string
  const amount = formData.get("amount") as string
  const description = formData.get("description") as string
  const status = "pending" // Default status

  if (!operatorId || !amount || !description) {
    return { error: { message: "Tutti i campi sono obbligatori." } }
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert([
      {
        operator_id: operatorId,
        amount: Number.parseFloat(amount),
        description,
        status,
        // issued_at e due_date vengono impostati di default dal DB
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("Errore creazione fattura:", error)
    return { error }
  }

  revalidatePath("/admin/invoices")
  return { data }
}

export async function getInvoices() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`
      *,
      profiles:operator_id (
        username,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Errore nel recuperare le fatture:", error)
    return { data: [], error }
  }

  // Supabase con il join restituisce `profiles` come oggetto, lo normalizziamo
  const invoices = data.map((inv) => ({
    ...inv,
    operator_username: inv.profiles?.username || "N/A",
    operator_avatar_url: inv.profiles?.avatar_url,
  }))

  return { data: invoices, error: null }
}
