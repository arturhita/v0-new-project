"use server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateConsultationRating(consultationId: string, rating: number) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("consultations").update({ rating }).eq("id", consultationId)
  if (error) return { success: false, error }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function cancelConsultation(consultationId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("consultations").update({ status: "cancelled" }).eq("id", consultationId)
  if (error) return { success: false, error }
  revalidatePath("/dashboard/client/consultations")
  return { success: true }
}

export async function getClientConsultations() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("consultations")
    .select("*, operator:operator_id(full_name)")
    .eq("user_id", user.id)
  if (error) return []
  return data
}
