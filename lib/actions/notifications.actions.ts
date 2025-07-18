"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getBroadcastNotifications() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("broadcast_notifications")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching broadcast notifications:", error)
    return []
  }
  return data
}

export async function sendBroadcastNotification(formData: FormData) {
  const supabase = createClient()
  const notificationData = {
    title: formData.get("title") as string,
    message: formData.get("message") as string,
    target_role: formData.get("target_role") as "all" | "client" | "operator",
  }

  const { error } = await supabase.from("broadcast_notifications").insert(notificationData)

  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { success: false, message: "Errore durante l'invio della notifica." }
  }

  revalidatePath("/admin/notifications")
  return { success: true, message: "Notifica inviata con successo." }
}
