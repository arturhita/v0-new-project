"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function sendBroadcastNotification(formData: FormData) {
  const title = formData.get("title") as string
  const message = formData.get("message") as string
  const recipientType = formData.get("recipientType") as "all" | "users" | "operators"

  if (!title || !message || !recipientType) {
    return { error: "Titolo, messaggio e destinatari sono obbligatori." }
  }

  try {
    const supabase = createAdminClient()

    let userQuery = supabase.from("profiles").select("id")

    if (recipientType === "users") {
      userQuery = userQuery.eq("role", "client")
    } else if (recipientType === "operators") {
      userQuery = userQuery.eq("role", "operator")
    }

    const { data: users, error: usersError } = await userQuery

    if (usersError) {
      console.error("Error fetching users for notification:", usersError)
      throw new Error("Impossibile recuperare l'elenco dei destinatari.")
    }

    if (!users || users.length === 0) {
      return { error: "Nessun destinatario trovato per i criteri selezionati." }
    }

    const notifications = users.map((user) => ({
      user_id: user.id,
      title,
      message,
      type: "broadcast",
      is_read: false,
    }))

    const { error: insertError } = await supabase.from("notifications").insert(notifications)

    if (insertError) {
      console.error("Error inserting broadcast notifications:", insertError)
      throw new Error("Impossibile inviare le notifiche.")
    }

    revalidatePath("/admin/notifications")
    return { success: `Notifica inviata con successo a ${users.length} destinatari.` }
  } catch (error: any) {
    return { error: error.message }
  }
}
