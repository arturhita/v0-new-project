"use server"

import { revalidatePath } from "next/cache"
import { getOperatorById } from "./operator.actions"

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

const mockWrittenConsultations: WrittenConsultation[] = []
const mockUserWallets = new Map<string, number>([["user_client_123", 150.0]])

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
  const clientWallet = mockUserWallets.get(clientId) || 0

  if (clientWallet < cost) {
    return { success: false, error: "Credito insufficiente." }
  }

  mockUserWallets.set(clientId, clientWallet - cost)

  const newConsultation: WrittenConsultation = {
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
  }

  mockWrittenConsultations.unshift(newConsultation)

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true, message: "Domanda inviata!" }
}

export async function getWrittenConsultationsForClient(clientId: string) {
  return mockWrittenConsultations.filter((c) => c.clientId === clientId)
}

export async function getWrittenConsultationsForOperator(operatorId: string) {
  return mockWrittenConsultations.filter((c) => c.operatorId === operatorId)
}

export async function answerWrittenConsultation(formData: FormData) {
  const consultationId = formData.get("consultationId") as string
  const answer = formData.get("answer") as string

  if (!consultationId || !answer) {
    return { success: false, error: "Dati mancanti." }
  }

  const consultation = mockWrittenConsultations.find((c) => c.id === consultationId)
  if (!consultation) {
    return { success: false, error: "Consultazione non trovata." }
  }

  consultation.answer = answer
  consultation.status = "answered"
  consultation.answeredAt = new Date()

  revalidatePath("/dashboard/client/written-consultations")
  revalidatePath("/dashboard/operator/written-consultations")

  return { success: true, message: "Risposta inviata!" }
}
