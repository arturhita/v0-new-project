"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getClientConsultations() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("consultations")
    .select("*, operator:operator_id(stage_name, avatar_url)")
    .eq("client_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }
  return data
}

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)

  if (error) {
    return { success: false, message: "Failed to update rating." }
  }

  revalidatePath("/(platform)/dashboard/client/consultations")
  return { success: true, message: "Rating updated successfully." }
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ status: "cancelled" }).eq("id", consultationId)

  if (error) {
    return { success: false, message: "Failed to cancel consultation." }
  }

  revalidatePath("/(platform)/dashboard/client/consultations")
  return { success: true, message: "Consultation cancelled." }
}
