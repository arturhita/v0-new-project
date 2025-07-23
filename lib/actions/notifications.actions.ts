"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(title: string, message: string) {
  const { data, error } = await supabaseAdmin.from("notifications").insert({
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
