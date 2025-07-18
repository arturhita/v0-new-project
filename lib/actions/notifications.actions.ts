"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function sendBroadcastNotification(formData: FormData) {
  const supabase = createAdminClient()
  const rawData = {
    title: formData.get("title") as string,
    message: formData.get("message") as string,
    target_role: formData.get("target_role") as "all" | "client" | "operator",
  }

  const { error } = await supabase.rpc("send_broadcast_notification", {
    p_title: rawData.title,
    p_message: rawData.message,
    p_target_role: rawData.target_role,
  })

  if (error) {
    return { error: `Errore durante l'invio della notifica: ${error.message}` }
  }

  revalidatePath("/admin/notifications")
  return { success: "Notifica inviata con successo." }
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
