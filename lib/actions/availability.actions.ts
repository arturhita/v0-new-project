"use server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function saveOperatorAvailability(availability: any) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const adminSupabase = createAdminClient()
  const { error } = await adminSupabase
    .from("operator_availability")
    .upsert({ user_id: user.id, schedule: availability }, { onConflict: "user_id" })
  if (error) return { success: false, error }
  revalidatePath("/dashboard/operator/availability")
  return { success: true }
}

export async function getOperatorAvailability() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("operator_availability")
    .select("schedule")
    .eq("user_id", user.id)
    .single()
  if (error) return null
  return data.schedule
}
