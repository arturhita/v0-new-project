"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(title: string, message: string) {
  const supabase = createAdminClient()
  console.log("--- BROADCAST NOTIFICATION ---")
  console.log("Title:", title)
  console.log("Message:", message)

  const { data: users, error } = await supabase.from("profiles").select("id")
  if (error) {
    return { success: false, message: "Could not fetch users." }
  }
  console.log(`Broadcast intended for ${users.length} users.`)
  return { success: true, message: "Broadcast notification sent successfully (logged)." }
}
