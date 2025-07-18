"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function sendInternalMessage(formData: FormData) {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Utente non autenticato." }
  }

  const rawFormData = {
    recipientId: formData.get("recipientId") as string,
    subject: formData.get("subject") as string,
    body: formData.get("body") as string,
  }

  if (!rawFormData.recipientId || !rawFormData.subject || !rawFormData.body) {
    return { error: "Tutti i campi sono obbligatori." }
  }

  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("internal_messages").insert({
    sender_id: user.id,
    recipient_id: rawFormData.recipientId,
    subject: rawFormData.subject,
    body: rawFormData.body,
  })

  if (error) {
    console.error("Error sending internal message:", error)
    return { error: "Impossibile inviare il messaggio." }
  }

  revalidatePath("/admin/dashboard")
  return { success: "Messaggio inviato con successo." }
}

export async function sendNewsletter(formData: FormData) {
  const supabase = createAdminClient()

  const subject = formData.get("subject") as string
  const content = formData.get("content") as string

  if (!subject || !content) {
    return { error: "Oggetto e contenuto sono obbligatori." }
  }

  const { error } = await supabase.from("newsletters").insert({
    subject,
    content,
    status: "sent",
    sent_at: new Date().toISOString(),
  })

  if (error) {
    console.error("Error sending newsletter:", error)
    return { error: "Errore durante l'invio della newsletter." }
  }

  return { success: "Newsletter inviata con successo." }
}
