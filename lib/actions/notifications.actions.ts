"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

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

export async function getBroadcastNotifications() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("broadcast_notifications")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching notifications:", error)
    return []
  }
  return data
}
