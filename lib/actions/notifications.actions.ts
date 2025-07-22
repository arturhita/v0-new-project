"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(message: string) {
  // This is a simplified version. A real implementation would be more complex.
  // It might involve creating a notification entry for each user.
  const { data: users, error: userError } = await supabaseAdmin.from("profiles").select("id")

  if (userError) {
    return { error: userError.message }
  }

  if (!users) {
    return { error: "No users found to send notification to." }
  }

  const notifications = users.map((user) => ({
    user_id: user.id,
    message,
    type: "broadcast",
  }))

  const { error } = await supabaseAdmin.from("notifications").insert(notifications)

  if (error) {
    return { error: error.message }
  }

  return { success: `Broadcast sent to ${users.length} users.` }
}
