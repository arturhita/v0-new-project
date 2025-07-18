"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getAdminNotifications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching admin notifications:", error)
    return { unread: [], read: [] }
  }

  const unread = data.filter((n) => !n.is_read)
  const read = data.filter((n) => n.is_read)

  return { unread, read }
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("admin_notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    console.error("Error marking notification as read:", error)
    return { success: false, error }
  }

  revalidatePath("/admin/notifications")
  return { success: true }
}

export async function markAllNotificationsAsRead() {
  const supabase = createClient()
  const { error } = await supabase.from("admin_notifications").update({ is_read: true }).eq("is_read", false)

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { success: false, error }
  }

  revalidatePath("/admin/notifications")
  return { success: true }
}
