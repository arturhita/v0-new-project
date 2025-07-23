"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

interface SendWrittenConsultationArgs {
  clientId: string
  operatorId: string
  question: string
  price: number
}

export async function sendWrittenConsultation({ clientId, operatorId, question, price }: SendWrittenConsultationArgs) {
  const supabase = createClient()

  // 1. Check user's wallet balance
  const { data: walletData, error: walletError } = await supabase.rpc("get_wallet_balance", {
    user_id_param: clientId,
  })

  if (walletError) {
    console.error("Error fetching wallet balance:", walletError)
    return { success: false, error: "Impossibile verificare il saldo del portafoglio." }
  }

  const balance = walletData as number
  if (balance < price) {
    return { success: false, error: "Credito insufficiente nel tuo portafoglio." }
  }

  // 2. Deduct from wallet and get transaction ID
  const { data: transactionData, error: transactionError } = await supabase
    .rpc("update_wallet_balance", {
      user_id_param: clientId,
      amount_param: -price, // Negative amount to deduct
      description_param: `Consulto scritto con operatore ${operatorId}`,
    })
    .single()

  if (transactionError) {
    console.error("Error deducting from wallet:", transactionError)
    return { success: false, error: "Errore durante l'addebito sul portafoglio." }
  }

  const transactionId = transactionData.transaction_id

  // 3. Insert the written consultation
  const { error: insertError } = await supabase.from("written_consultations").insert({
    client_id: clientId,
    operator_id: operatorId,
    question: question,
    cost: price,
    status: "pending",
    transaction_id: transactionId,
  })

  if (insertError) {
    console.error("Error inserting written consultation:", insertError)
    // TODO: Implement a refund mechanism if this step fails
    return { success: false, error: "Impossibile inviare la domanda. Contatta il supporto." }
  }

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true }
}

export async function getWrittenConsultationsForClient(clientId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("written_consultations").select().eq("client_id", clientId)

  if (error) {
    console.error("Error fetching written consultations for client:", error)
    return []
  }

  return data
}

export async function getWrittenConsultationsForOperator(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("written_consultations").select().eq("operator_id", operatorId)

  if (error) {
    console.error("Error fetching written consultations for operator:", error)
    return []
  }

  return data
}

export async function answerWrittenConsultation(formData: FormData) {
  const consultationId = formData.get("consultationId") as string
  const answer = formData.get("answer") as string

  if (!consultationId || !answer) {
    return { success: false, error: "Dati mancanti per la risposta." }
  }

  const supabase = createClient()
  const { error: updateError } = await supabase
    .from("written_consultations")
    .update({ answer: answer, status: "answered", answered_at: new Date() })
    .eq("id", consultationId)

  if (updateError) {
    console.error("Error updating written consultation:", updateError)
    return { success: false, error: "Errore durante l'invio della risposta." }
  }

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true, message: "Risposta inviata con successo!" }
}

export interface WrittenConsultation {
  id: string
  client_id: string
  operator_id: string
  question: string
  answer: string | null
  status: "pending" | "answered" | "cancelled"
  cost: number
  created_at: Date
  answered_at: Date | null
  transaction_id: string
}
