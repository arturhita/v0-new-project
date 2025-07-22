"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveOperatorAvailability(availability: any) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data, error } = await supabase
    .from("operator_availability")
    .upsert({ user_id: user.id, schedule: availability }, { onConflict: "user_id" })

  if (error) {
    console.error("Error saving availability:", error)
    return { error: error.message }
  }
  revalidatePath("/dashboard/operator/availability")
  return { success: true }
}

export async function getOperatorAvailability() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { schedule: {} }

  const { data, error } = await supabase
    .from("operator_availability")
    .select("schedule")
    .eq("user_id", user.id)
    .single()

  if (error || !data) {
    return { schedule: {} }
  }
  return data
}
