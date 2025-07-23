"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(title: string, message: string) {
  const supabase = createAdminClient()
  // This is a placeholder. Real implementation would be more complex.
  const { data, error } = await supabase.from("notifications").insert({
    title,
    message,
    is_broadcast: true,
  })
  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { success: false, error }
  }
  return { success: true }
}
