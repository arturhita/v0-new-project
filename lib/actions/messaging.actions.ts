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

  revalidatePath("/admin/dashboard")
  return { success: "Messaggio inviato con successo." }
}

export async function sendNewsletter(subject: string, content: string, recipients: string[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  if (!subject || !content) {
    return { success: false, message: "Oggetto e contenuto sono obbligatori." }
  }

  if (!recipients || recipients.length === 0) {
    return { success: false, message: "Nessun destinatario selezionato." }
  }

  // In un'app reale, qui si attiverebbe un servizio di invio email.
  // Per ora, salviamo la newsletter nel database e registriamo il numero di destinatari.
  const { error } = await supabase.from("newsletters").insert({
    subject,
    content,
    sent_by: user.id,
    status: "sent",
    sent_at: new Date().toISOString(),
    recipient_count: recipients.length,
  })

  if (error) {
    console.error("Errore durante il salvataggio della newsletter:", error)
    return { success: false, message: "Errore durante il salvataggio della newsletter." }
  }

  revalidatePath("/admin/promotions")
  return { success: true, message: `Newsletter inviata a ${recipients.length} destinatari.` }
}
