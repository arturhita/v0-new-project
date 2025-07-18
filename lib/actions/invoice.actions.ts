"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { unstable_noStore as noStore } from "next/cache"

export async function createInvoice(formData: FormData) {
  const supabase = createSupabaseServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato" }
  }

  const rawFormData = {
    operator_id: formData.get("operator_id") as string,
    amount: Number(formData.get("amount")),
    due_date: formData.get("due_date") as string,
    description: formData.get("description") as string,
  }

  // Basic validation
  if (!rawFormData.operator_id || !rawFormData.amount || !rawFormData.due_date) {
    return { error: "Dati mancanti per la creazione della fattura." }
  }

  const { data, error } = await supabase
    .from("invoices")
    .insert({
      operator_id: rawFormData.operator_id,
      amount: rawFormData.amount,
      due_date: rawFormData.due_date,
      status: "pending",
      description: rawFormData.description,
      generated_by: user.id,
    })
    .select()
    .single()

  if (error) {
    console.error("Errore creazione fattura:", error)
    return { error: "Impossibile creare la fattura." }
  }

  revalidatePath("/admin/invoices")
  return { success: `Fattura #${data.id} creata con successo.` }
}

export async function getInvoices() {
  noStore()
  const supabase = createSupabaseServerClient()
  const { data, error } = await supabase
    .from("invoices")
    .select(`*, profile:profiles!user_id(full_name, stage_name)`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Errore nel recupero delle fatture:", error)
    return []
  }

  return data.map((inv) => ({
    ...inv,
    operator_name: inv.profile?.stage_name || inv.profile?.full_name || "N/D",
  }))
}

// ... altre azioni per fatture
