"use server"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function cancelConsultation(consultationId: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("consultations").update({ status: "cancelled" }).eq("id", consultationId)
  if (error) return { error: error.message }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function getClientConsultations() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from("consultations")
    .select("*, operator:operator_id(full_name)")
    .eq("client_id", user.id)
  if (error) return []
  return data
}
