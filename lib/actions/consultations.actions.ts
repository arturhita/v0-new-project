"use server"
import { createClient } from "@/lib/supabase/server"

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)
  if (error) throw error
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ status: "cancelled" }).eq("id", consultationId)
  if (error) throw error
}

export async function getClientConsultations(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("consultations")
    .select("*, operator:operator_id(username, avatar_url)")
    .eq("client_id", clientId)
  if (error) throw error
  return data
}
