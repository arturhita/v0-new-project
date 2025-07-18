"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function sendInternalMessage(fromUserId: string, toUserId: string, subject: string, message: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("internal_messages").insert({
    sender_id: fromUserId,
    recipient_id: toUserId,
    subject: subject,
    body: message,
  })

  if (error) {
    console.error("Error sending internal message:", error)
    return { success: false, message: "Errore nell'invio del messaggio." }
  }

  revalidatePath("/admin/messages") // o dove vengono visualizzati i messaggi
  return { success: true, message: "Messaggio inviato con successo." }
}

export async function sendNewsletter(subject: string, content: string, sentBy: string) {
  const supabase = createAdminClient()

  // Inserisce la newsletter nel DB
  const { data, error } = await supabase
    .from("newsletters")
    .insert({
      subject,
      content,
      sent_by: sentBy,
      status: "sent",
      sent_at: new Date().toISOString(),
    })
    .select("id")
    .single()

  if (error || !data) {
    console.error("Error sending newsletter:", error)
    return { success: false, message: "Errore nell'invio della newsletter." }
  }

  // Qui in un'app reale, si attiverebbe un processo in background
  // per inviare le email a tutti gli iscritti.
  // Per ora, simuliamo solo il salvataggio.

  revalidatePath("/admin/promotions") // o dove si gestiscono le newsletter
  return { success: true, message: `Newsletter "${subject}" salvata e pronta per l'invio.` }
}
