"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createInvoice(formData: FormData) {
  const supabase = createClient()

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
  const supabase = createClient()
  // FIX: Usiamo la sintassi di join esplicita per evitare l'errore di cache dello schema.
  // Specifichiamo la tabella di join (profiles) e la colonna (full_name).
  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      *,
      profile:operator_id (
        full_name
      )
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Errore nel recupero delle fatture:", error)
    // Restituiamo un oggetto con una chiave 'error' per una gestione coerente
    return { invoices: [], error: "Impossibile recuperare le fatture." }
  }

  // La join restituisce 'profile' come un oggetto, lo appiattiamo per comodità.
  const invoices = data.map((invoice) => ({
    ...invoice,
    operator_name: (invoice.profile as any)?.full_name || "N/A",
    profile: undefined, // Rimuoviamo l'oggetto nestato per pulizia
  }))

  return { invoices, error: null }
}
