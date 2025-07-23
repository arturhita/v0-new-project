"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const CommissionRequestSchema = z.object({
  requestedCommission: z.coerce
    .number()
    .min(0, "La percentuale non può essere negativa.")
    .max(100, "La percentuale non può superare 100."),
  justification: z
    .string()
    .min(10, "La motivazione deve contenere almeno 10 caratteri.")
    .max(500, "La motivazione non può superare i 500 caratteri."),
})

export async function submitCommissionRequest(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Utente non autenticato.")
  }

  const validatedFields = CommissionRequestSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    throw new Error("Dati non validi.")
  }

  const { requestedCommission, justification } = validatedFields.data

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()

  if (!profile) {
    throw new Error("Profilo operatore non trovato.")
  }

  const { error: insertError } = await supabase.from("commission_requests").insert({
    operator_id: user.id,
    current_commission_rate: profile.commission_rate || 15,
    requested_commission_rate: requestedCommission,
    justification,
  })

  if (insertError) {
    throw insertError
  }

  revalidatePath("/(platform)/dashboard/operator/commission-request")
  revalidatePath("/admin/commission-requests-log")

  return { success: true, message: "Richiesta inviata con successo!" }
}

export async function getCommissionRequestsForOperator(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("commission_requests").select("*").eq("operator_id", operatorId)
  if (error) throw error
  return data
}

export async function getAllCommissionRequests() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("commission_requests").select("*, profiles(username)")
  if (error) throw error
  return data
}

export async function updateCommissionRequestStatus(id: string, status: "approved" | "rejected") {
  const supabase = createAdminClient()
  const { error } = await supabase.from("commission_requests").update({ status }).eq("id", id)
  if (error) throw error
}
