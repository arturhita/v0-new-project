"use server"

import { createAdminClient } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(notificationData: {
  title: string
  message: string
  targetRole?: "client" | "operator" | "all"
}) {
  const supabase = createAdminClient()

  try {
    // Get target users
    let query = supabase.from("profiles").select("id, full_name, role")

    if (notificationData.targetRole && notificationData.targetRole !== "all") {
      query = query.eq("role", notificationData.targetRole)
    }

    const { data: users, error: usersError } = await query

    if (usersError) throw usersError

    // Create notification records (you'd need a notifications table)
    const notifications =
      users?.map((user) => ({
        user_id: user.id,
        title: notificationData.title,
        message: notificationData.message,
        type: "broadcast",
        is_read: false,
      })) || []

    // Insert notifications (assuming you have a notifications table)
    // const { error: notificationError } = await supabase
    //   .from("notifications")
    //   .insert(notifications)

    // if (notificationError) throw notificationError

    return { success: true, sentTo: users?.length || 0 }
  } catch (error) {
    console.error("Error sending broadcast notification:", error)
    return { success: false, error: "Failed to send notification" }
  }
}
