"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getClientConsultations(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select(
      `
      *,
      operator:profiles!operator_id(stage_name, avatar_url)
    `,
    )
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }
  return data
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("consultations")
    .update({ status: "cancelled_by_client" })
    .eq("id", consultationId)

  if (error) {
    return { success: false, message: "Impossibile annullare la consultazione." }
  }

  revalidatePath("/dashboard/client/consultations")
  return { success: true, message: "Consultazione annullata." }
}

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)

  if (error) {
    return { success: false, message: "Impossibile aggiornare la valutazione." }
  }

  revalidatePath("/dashboard/client/consultations")
  return { success: true, message: "Valutazione aggiornata." }
}
