"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendBroadcastNotification(formData: FormData) {
  const supabase = createServerClient()

  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const target_role = formData.get("target_role") as "all" | "client" | "operator"

  const { error } = await supabase.rpc("send_broadcast_notification", {
    p_title: title,
    p_message: message,
    p_target_role: target_role,
  })

  if (error) {
    console.error("Error sending broadcast notification:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/admin/notifications")
  return { success: true, message: "Notifica inviata con successo." }
}

export async function getBroadcastHistory() {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from("broadcast_notifications")
    .select("*")
    .order("sent_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching broadcast history:", error)
    return []
  }
  return data
}
