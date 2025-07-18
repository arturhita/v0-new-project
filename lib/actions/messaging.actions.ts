"use server"

import { createClient } from "@/lib/supabase/server"

export async function sendInternalMessage(formData: FormData) {
  const supabase = createClient()

  const recipientId = formData.get("recipient_id") as string
  const subject = formData.get("subject") as string
  const content = formData.get("content") as string

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "Utente non autenticato." } }
  }

  if (!recipientId || !subject || !content) {
    return { error: { message: "Tutti i campi sono obbligatori." } }
  }

  const { data, error } = await supabase.from("internal_messages").insert({
    sender_id: user.id,
    recipient_id: recipientId,
    subject,
    content,
  })

  if (error) {
    console.error("Errore invio messaggio interno:", error)
    return { error }
  }

  return { data: { message: "Messaggio inviato con successo!" } }
}

export async function sendNewsletter(formData: FormData) {
  const supabase = createClient()
  const subject = formData.get("subject") as string
  const content = formData.get("content") as string

  if (!subject || !content) {
    return { error: { message: "Oggetto e contenuto sono obbligatori." } }
  }

  // 1. Recupera tutti gli utenti iscritti alla newsletter
  // (Assumiamo ci sia una colonna 'subscribed_to_newsletter' nella tabella 'profiles')
  const { data: users, error: usersError } = await supabase
    .from("profiles")
    .select("user_id, email")
    .eq("subscribed_to_newsletter", true)

  if (usersError) {
    console.error("Errore nel recuperare gli iscritti:", usersError)
    return { error: { message: "Impossibile recuperare gli iscritti." } }
  }

  if (!users || users.length === 0) {
    return { data: { message: "Nessun utente iscritto alla newsletter." } }
  }

  // 2. Invia una notifica interna a ciascun utente
  const messages = users.map((user) => ({
    recipient_id: user.user_id,
    sender_id: "a1a1a1a1-a1a1-a1a1-a1a1-a1a1a1a1a1a1", // ID fittizio per "Sistema"
    subject: `Newsletter: ${subject}`,
    content,
    is_system_message: true,
  }))

  const { error: insertError } = await supabase.from("internal_messages").insert(messages)

  if (insertError) {
    console.error("Errore invio newsletter come messaggio interno:", insertError)
    return { error: { message: "Errore durante l-invio della newsletter." } }
  }

  // Qui andrebbe la logica per l'invio email reale, se configurata
  // E.g., using a service like Resend or SendGrid

  return { data: { message: `Newsletter inviata a ${users.length} iscritti.` } }
}
