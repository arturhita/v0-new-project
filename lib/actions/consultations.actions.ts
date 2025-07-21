"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

export interface Consultation {
  id: string
  operatorName: string
  operatorAvatar: string | null
  consultationType: "chat" | "call" | "email"
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  scheduledAt: string | null
  startedAt: string | null
  endedAt: string | null
  durationMinutes: number | null
  totalCost: number | null
  rating: number | null
  reviewText: string | null
  createdAt: string
}

export async function getClientConsultations(clientId: string): Promise<Consultation[]> {
  noStore()
  const supabase = createClient()

  const { data, error } = await supabase.rpc("get_client_consultations", {
    p_client_id: clientId,
  })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }

  return (data || []).map((consultation: any) => ({
    id: consultation.id,
    operatorName: consultation.operator_name || "Operatore",
    operatorAvatar: consultation.operator_avatar,
    consultationType: consultation.consultation_type,
    status: consultation.status,
    scheduledAt: consultation.scheduled_at,
    startedAt: consultation.started_at,
    endedAt: consultation.ended_at,
    durationMinutes: consultation.duration_minutes,
    totalCost: consultation.total_cost,
    rating: consultation.rating,
    reviewText: consultation.review_text,
    createdAt: consultation.created_at,
  }))
}

export async function updateConsultationRating(consultationId: string, rating: number, reviewText?: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("consultations")
    .update({
      rating,
      review_text: reviewText,
      updated_at: new Date().toISOString(),
    })
    .eq("id", consultationId)

  if (error) {
    console.error("Error updating consultation rating:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("consultations")
    .update({
      status: "cancelled",
      updated_at: new Date().toISOString(),
    })
    .eq("id", consultationId)

  if (error) {
    console.error("Error cancelling consultation:", error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
