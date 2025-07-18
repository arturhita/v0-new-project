"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getAdminNotifications() {
  const supabase = createAdminClient()
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
  const supabase = createAdminClient()
  const { error } = await supabase.from("admin_notifications").update({ is_read: true }).eq("id", notificationId)

  if (error) {
    return { success: false, error }
  }

  revalidatePath("/admin/notifications")
  return { success: true }
}

export async function sendBroadcastNotification(formData: FormData) {
  const supabase = createAdminClient()
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const targetRole = formData.get("target_role") as "all" | "client" | "operator"

  if (!title || !message) {
    return { error: "Titolo e messaggio sono obbligatori." }
  }

  const { error } = await supabase.rpc("send_broadcast_notification", {
    p_title: title,
    p_message: message,
    p_target_role: targetRole,
  })

  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { error: "Impossibile inviare la notifica." }
  }

  revalidatePath("/admin/notifications")
  return { success: "Notifica broadcast registrata con successo." }
}
