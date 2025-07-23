"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function startConsultation(operatorId: string) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { data, error } = await supabase.rpc("start_live_consultation", {
    p_operator_id: operatorId,
  })

  if (error) {
    console.error("Errore RPC start_live_consultation:", error)
    return { success: false, message: "Errore del server durante l'avvio della consulenza." }
  }

  return data
}

export async function endConsultation(consultationId: string, durationSeconds: number) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  if (durationSeconds < 0) {
    return { success: false, message: "La durata non può essere negativa." }
  }

  const { data, error } = await supabase.rpc("end_live_consultation", {
    p_consultation_id: consultationId,
    p_duration_seconds: durationSeconds,
  })

  if (error) {
    console.error("Errore RPC end_live_consultation:", error)
    return { success: false, message: "Errore del server durante la chiusura della consulenza." }
  }

  if (data.success) {
    revalidatePath("/dashboard/client/wallet")
    revalidatePath("/dashboard/client/consultations")
    revalidatePath("/dashboard/operator/earnings")
  }

  return data
}
