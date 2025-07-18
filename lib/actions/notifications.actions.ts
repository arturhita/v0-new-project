"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const NotificationSchema = z.object({
  title: z.string().min(1, "Il titolo è obbligatorio."),
  message: z.string().min(1, "Il messaggio è obbligatorio."),
  target_role: z.enum(["all", "client", "operator"]),
})

export async function sendBroadcastNotification(formData: FormData) {
  const supabase = createAdminClient()
  const rawData = Object.fromEntries(formData.entries())

  const validation = NotificationSchema.safeParse(rawData)

  if (!validation.success) {
    return {
      error: "Dati non validi.",
      fieldErrors: validation.error.flatten().fieldErrors,
    }
  }

  const { title, message, target_role } = validation.data

  const { error } = await supabase.rpc("send_broadcast_notification", {
    p_title: title,
    p_message: message,
    p_target_role: target_role,
  })

  if (error) {
    console.error("Error sending notification:", error)
    return { error: "Impossibile inviare la notifica." }
  }

  revalidatePath("/admin/notifications")
  return { success: true }
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
    throw new Error("Impossibile caricare le notifiche.")
  }
  return data
}
