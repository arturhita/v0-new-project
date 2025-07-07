"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

// Schema per la validazione della richiesta di commissione
const CommissionRequestSchema = z.object({
  operator_id: z.string().uuid(),
  current_commission_rate: z.coerce.number(),
  requested_commission_rate: z.coerce.number().min(0).max(100),
  reason: z.string().min(10, "La motivazione è troppo corta."),
})

export async function submitCommissionRequest(formData: FormData) {
  const supabase = createClient()

  const validatedFields = CommissionRequestSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    console.error("Validation failed:", validatedFields.error.flatten().fieldErrors)
    return { error: "Dati non validi." }
  }

  const { operator_id, current_commission_rate, requested_commission_rate, reason } = validatedFields.data

  // Controlla se esiste già una richiesta in sospeso
  const { data: existingPending, error: existingError } = await supabase
    .from("commission_requests")
    .select("id")
    .eq("operator_id", operator_id)
    .eq("status", "pending")
    .single()

  if (existingPending) {
    return { error: "Hai già una richiesta in sospeso." }
  }

  const { error } = await supabase.from("commission_requests").insert({
    operator_id,
    current_commission_rate,
    requested_commission_rate,
    reason,
    status: "pending",
  })

  if (error) {
    console.error("Error submitting commission request:", error)
    return { error: "Impossibile inviare la richiesta." }
  }

  revalidatePath("/dashboard/operator/commission-request")
  return { success: "Richiesta inviata con successo." }
}

export async function getCommissionRequests(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", operatorId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching commission requests:", error)
    return []
  }
  return data
}

// Funzioni per l'admin
export async function getAllCommissionRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select(`
            *,
            profiles (
                full_name,
                email
            )
        `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all commission requests:", error)
    return []
  }
  return data
}

const HandleRequestSchema = z.object({
  requestId: z.string().uuid(),
  operatorId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  newRate: z.coerce.number(),
  notes: z.string().optional(),
})

export async function handleCommissionRequest(formData: FormData) {
  const supabase = createClient()
  const validatedFields = HandleRequestSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    console.error("Invalid form data for handling request:", validatedFields.error.flatten().fieldErrors)
    return { error: "Dati non validi." }
  }

  const { requestId, operatorId, action, newRate, notes } = validatedFields.data

  if (action === "approve") {
    // 1. Aggiorna la commissione sul profilo dell'operatore
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ commission_rate: newRate })
      .eq("id", operatorId)

    if (profileError) {
      console.error("Error updating profile commission:", profileError)
      return { error: "Errore nell'aggiornamento del profilo." }
    }

    // 2. Aggiorna lo stato della richiesta
    const { error: requestError } = await supabase
      .from("commission_requests")
      .update({ status: "approved", admin_notes: notes })
      .eq("id", requestId)

    if (requestError) {
      console.error("Error updating request status:", requestError)
      // Potremmo voler gestire un rollback qui
      return { error: "Errore nell'aggiornamento della richiesta." }
    }
  } else {
    // Azione di rifiuto
    const { error: requestError } = await supabase
      .from("commission_requests")
      .update({ status: "rejected", rejection_reason: notes })
      .eq("id", requestId)

    if (requestError) {
      console.error("Error rejecting request:", requestError)
      return { error: "Errore nel rifiutare la richiesta." }
    }
  }

  revalidatePath("/admin/commission-requests")
  return { success: "Richiesta processata con successo." }
}
