"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getBroadcastNotifications() {
  const supabase = createAdminClient()
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
  const supabase = createAdminClient()
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const target_role = formData.get("target_role") as "all" | "client" | "operator"

  if (!title || !message) {
    return { error: "Titolo e messaggio sono obbligatori." }
  }

  const { error } = await supabase.from("broadcast_notifications").insert([{ title, message, target_role }])

  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { error: "Impossibile inviare la notifica." }
  }

  revalidatePath("/admin/notifications")
  return { success: "Notifica inviata con successo." }
}
