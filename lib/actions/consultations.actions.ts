"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("consultations").update({ status: "cancelled" }).eq("id", consultationId)

  if (error) return { error: error.message }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function getClientConsultations() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("consultations")
    .select("*, operator:profiles(full_name, avatar_url)")
    .eq("client_id", user.id)
    .order("start_time", { ascending: false })

  if (error) {
    console.error("Error fetching client consultations:", error)
    return []
  }
  return data
}
