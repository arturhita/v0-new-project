"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"

export async function sendBroadcastNotification(notification: {
  title: string
  message: string
  target_role?: "all" | "client" | "operator"
}) {
  // This is a placeholder for a more complex notification system.
  // In a real app, this would insert into a notifications table and possibly trigger push notifications.
  console.log("Sending broadcast notification:", notification)
  const { error } = await supabaseAdmin.from("notifications").insert({
    title: notification.title,
    message: notification.message,
    target_role: notification.target_role || "all",
  })
  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { error: error.message }
  }
  return { success: true }
}
