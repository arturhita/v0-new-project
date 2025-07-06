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
    const { error } = await supabase.rpc("process_written_consultation", {
      p_client_id: clientId,
      p_operator_id: operatorId,
      p_question: question,
    })

    if (error) {
      console.error("Errore RPC process_written_consultation:", error)
      if (error.message.includes("insufficient funds")) {
        return { error: "Credito insufficiente per completare la richiesta." }
      }
      return { error: `Si è verificato un errore: ${error.message}` }
    }

    revalidatePath(`/dashboard/client/written-consultations`)
    revalidatePath(`/dashboard/operator/written-consultations`)

    return { success: "La tua richiesta è stata inviata con successo!" }
  } catch (e) {
    const error = e as Error
    console.error("Catch block error:", error)
    return { error: `Un errore imprevisto ha impedito la richiesta: ${error.message}` }
  }
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Non autorizzato." }
  }

  try {
    const { error } = await supabase.rpc("answer_and_credit_operator", {
      p_consultation_id: consultationId,
      p_operator_id: user.id,
      p_answer_text: answer,
    })

    if (error) {
      console.error("Errore RPC answer_and_credit_operator:", error)
      return { error: `Si è verificato un errore: ${error.message}` }
    }

    revalidatePath(`/dashboard/client/written-consultations`)
    revalidatePath(`/dashboard/operator/written-consultations`)

    return { success: "Risposta inviata e accreditata con successo!" }
  } catch (e) {
    const error = e as Error
    console.error("Catch block error:", error)
    return { error: `Un errore imprevisto ha impedito l'invio della risposta: ${error.message}` }
  }
}
