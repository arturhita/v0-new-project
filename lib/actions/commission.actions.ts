"use server"

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

export async function submitCommissionRequest(prevState: any, formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const validatedFields = CommissionRequestSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { requestedCommission, justification } = validatedFields.data

  const { data: profile } = await supabase.from("profiles").select("commission_rate").eq("id", user.id).single()

  if (!profile) {
    return { success: false, message: "Profilo operatore non trovato." }
  }

  const { error: insertError } = await supabase.from("commission_requests").insert({
    operator_id: user.id,
    current_commission_rate: profile.commission_rate || 15,
    requested_commission_rate: requestedCommission,
    justification,
  })

  if (insertError) {
    return { success: false, message: `Errore del database: ${insertError.message}` }
  }

  revalidatePath("/(platform)/dashboard/operator/commission-request")
  revalidatePath("/admin/commission-requests-log")

  return { success: true, message: "Richiesta inviata con successo!" }
}

export async function getCommissionRequestsForOperator() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("commission_requests")
    .select("*")
    .eq("operator_id", user.id)
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}

export async function getAllCommissionRequests() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("commission_requests")
    .select(
      `
      *,
      profile:profiles(stage_name)
    `,
    )
    .order("status", { ascending: true })
    .order("created_at", { ascending: false })

  if (error) return []
  return data
}

export async function updateCommissionRequestStatus(
  requestId: string,
  operatorId: string,
  newStatus: "approved" | "rejected",
  newCommission?: number,
) {
  const supabase = createClient()

  if (newStatus === "approved" && newCommission === undefined) {
    return { success: false, message: "La nuova commissione è richiesta per l'approvazione." }
  }

  if (newStatus === "approved") {
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ commission_rate: newCommission })
      .eq("id", operatorId)

    if (updateProfileError) {
      return { success: false, message: `Errore aggiornamento profilo: ${updateProfileError.message}` }
    }
  }

  const { error: updateRequestError } = await supabase
    .from("commission_requests")
    .update({ status: newStatus })
    .eq("id", requestId)

  if (updateRequestError) {
    return { success: false, message: `Errore aggiornamento richiesta: ${updateRequestError.message}` }
  }

  revalidatePath("/admin/commission-requests-log")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/admin/operators")

  return { success: true, message: `Richiesta ${newStatus === "approved" ? "approvata" : "rifiutata"}.` }
}
