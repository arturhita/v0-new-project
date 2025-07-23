"use server"

import { revalidatePath } from "next/cache"
import { getOperatorById } from "./operator.actions"
import { createClient } from "@/lib/supabase/server"

export interface WrittenConsultation {
  id: string
  clientId: string
  clientName: string
  operatorId: string
  operatorName: string
  question: string
  answer: string | null
  status: "pending_operator_response" | "answered" | "cancelled"
  cost: number
  createdAt: Date
  answeredAt: Date | null
}

const supabase = createClient()

export async function submitWrittenConsultation(formData: FormData) {
  const clientId = formData.get("clientId") as string
  const operatorId = formData.get("operatorId") as string
  const question = formData.get("question") as string

  if (!clientId || !operatorId || !question) {
    return { success: false, error: "Dati mancanti." }
  }

  const operator = await getOperatorById(operatorId)
  const operatorServices = operator?.services as any
  if (!operator || !operatorServices?.email?.enabled || !operatorServices?.email?.price) {
    return { success: false, error: "Operatore non disponibile per consulenze scritte." }
  }

  const cost = operatorServices.email.price
  const { data: clientWalletData, error: walletError } = await supabase
    .from("user_wallets")
    .select("balance")
    .eq("user_id", clientId)
    .single()

  if (walletError || !clientWalletData || clientWalletData.balance < cost) {
    return { success: false, error: "Credito insufficiente." }
  }

  const { error: updateWalletError } = await supabase
    .from("user_wallets")
    .update({ balance: clientWalletData.balance - cost })
    .eq("user_id", clientId)

  if (updateWalletError) {
    return { success: false, error: "Errore nell'aggiornamento del credito." }
  }

  const { data: consultationData, error: consultationError } = await supabase
    .from("written_consultations")
    .insert([
      {
        id: `wc_${Date.now()}`,
        clientId,
        clientName: "Mario Rossi", // Mock
        operatorId,
        operatorName: operator.stage_name,
        question,
        answer: null,
        status: "pending_operator_response",
        cost,
        createdAt: new Date(),
        answeredAt: null,
      },
    ])
    .select()

  if (consultationError) {
    return { success: false, error: "Errore nell'inserimento della consultazione." }
  }

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true, message: "Domanda inviata!" }
}

export async function getWrittenConsultationsForClient(clientId: string) {
  const { data: consultationsData, error: consultationsError } = await supabase
    .from("written_consultations")
    .select("*")
    .eq("clientId", clientId)

  if (consultationsError || !consultationsData) {
    return []
  }

  return consultationsData
}

export async function getWrittenConsultationsForOperator(operatorId: string) {
  const { data: consultationsData, error: consultationsError } = await supabase
    .from("written_consultations")
    .select("*")
    .eq("operatorId", operatorId)

  if (consultationsError || !consultationsData) {
    return []
  }

  return consultationsData
}

export async function answerWrittenConsultation(consultationId: string, answer: string) {
  if (!consultationId || !answer) {
    return { success: false, error: "Dati mancanti." }
  }

  const { data: consultationData, error: consultationError } = await supabase
    .from("written_consultations")
    .select("*")
    .eq("id", consultationId)
    .single()

  if (consultationError || !consultationData) {
    return { success: false, error: "Consultazione non trovata." }
  }

  const { error: updateConsultationError } = await supabase
    .from("written_consultations")
    .update({
      answer,
      status: "answered",
      answeredAt: new Date(),
    })
    .eq("id", consultationId)

  if (updateConsultationError) {
    return { success: false, error: "Errore nell'aggiornamento della consultazione." }
  }

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true, message: "Risposta inviata!" }
}
