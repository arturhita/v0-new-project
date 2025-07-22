"use server"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveOperatorAvailability(availability: any) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("operator_availability")
    .upsert({ operator_id: user.id, availability_data: availability }, { onConflict: "operator_id" })
  if (error) return { error: error.message }
  revalidatePath("/dashboard/operator/availability")
  return { success: true }
}

export async function getOperatorAvailability() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from("operator_availability")
    .select("availability_data")
    .eq("operator_id", user.id)
    .single()
  if (error || !data) return null
  return data.availability_data
}
