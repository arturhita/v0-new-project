"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function requestWrittenConsultation(operatorId: string, question: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Devi essere loggato per richiedere un consulto." }
  }
  const clientId = user.id

  try {
    // Usiamo una transazione per garantire che tutte le operazioni abbiano successo o falliscano insieme
    const { data, error } = await supabase.rpc("process_written_consultation", {
      p_client_id: clientId,
      p_operator_id: operatorId,
      p_question: question,
    })

    if (error) {
      console.error("Errore RPC:", error)
      // Fornisce un messaggio di errore più specifico se disponibile
      if (error.message.includes("insufficient funds")) {
        return { error: "Credito insufficiente per completare la richiesta." }
      }
      return { error: `Si è verificato un errore: ${error.message}` }
    }

    // Revalida le pagine pertinenti per mostrare i dati aggiornati
    revalidatePath(`/dashboard/client/written-consultations`)
    revalidatePath(`/dashboard/operator/written-consultations`)

    return { success: "La tua richiesta è stata inviata con successo!" }
  } catch (e) {
    const error = e as Error
    console.error("Catch block error:", error)
    return { error: `Un errore imprevisto ha impedito la richiesta: ${error.message}` }
  }
}
