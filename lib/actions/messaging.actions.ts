"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

// Invia messaggio interno
export async function sendInternalMessage(fromUserId: string, toUserId: string, subject: string, message: string) {
  const supabase = createAdminClient()

  const { error } = await supabase.from("internal_messages").insert({
    sender_id: fromUserId,
    recipient_id: toUserId,
    subject: subject,
    body: message,
  })

  if (error) {
    console.error("Errore invio messaggio interno:", error)
    return {
      success: false,
      message: "Errore nell'invio del messaggio.",
    }
  }

  revalidatePath("/admin/messages")
  revalidatePath(`/(platform)/dashboard/operator/internal-messages`)
  revalidatePath(`/(platform)/dashboard/client/messages`)

  return {
    success: true,
    message: "Messaggio inviato con successo.",
  }
}

// Invia newsletter (placeholder, implementazione reale è complessa)
export async function sendNewsletter(subject: string, content: string, recipients: string[]) {
  try {
    console.log("Invio newsletter (simulato):", { subject, recipients: recipients.length })
    // In una implementazione reale, qui si creerebbe un record nella tabella 'newsletters'
    // e si accoderebbero i job per l'invio delle email.
    await new Promise((resolve) => setTimeout(resolve, 2000))

    return {
      success: true,
      message: `Newsletter inviata (simulazione) a ${recipients.length} destinatari.`,
    }
  } catch (error) {
    console.error("Errore invio newsletter:", error)
    return {
      success: false,
      message: "Errore nell'invio della newsletter.",
    }
  }
}
