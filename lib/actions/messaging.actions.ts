"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendInternalMessage(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Utente non autenticato" }
  }

  const rawFormData = {
    recipientId: formData.get("recipientId") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
  }

  if (!rawFormData.recipientId || !rawFormData.subject || !rawFormData.body) {
    return { error: "Tutti i campi sono obbligatori." }
  }

  const { error } = await supabase.from("internal_messages").insert({
    sender_id: user.id,
    recipient_id: rawFormData.recipientId,
    subject: rawFormData.subject,
    body: rawFormData.body,
  })

  if (error) {
    console.error("Errore invio messaggio interno:", error)
    return { error: "Impossibile inviare il messaggio." }
  }

  revalidatePath("/admin/dashboard") // Or a more specific path
  return { success: "Messaggio inviato con successo." }
}
