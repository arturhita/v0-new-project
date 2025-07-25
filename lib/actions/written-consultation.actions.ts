"use server"

import { revalidatePath } from "next/cache"

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

// Mock data
const mockWrittenConsultations: WrittenConsultation[] = [
  {
    id: "wc_1",
    clientId: "user_client_123",
    clientName: "Mario Rossi",
    operatorId: "op_luna_stellare",
    operatorName: "Luna Stellare",
    question: "Troverò l'amore entro la fine dell'anno? Sono nato il 15/05/1990.",
    answer:
      "Le carte mostrano un incontro significativo in autunno. Un'energia forte e compatibile si sta avvicinando. Sii aperto alle nuove conoscenze, specialmente nel mese di Ottobre. Le stelle favoriscono i legami duraturi in quel periodo.",
    status: "answered",
    cost: 30,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    answeredAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
]

const mockUserWallets = new Map<string, number>([["user_client_123", 150.0]])

async function getOperatorById(operatorId: string) {
  // Mock operator data
  const mockOperators = new Map([
    [
      "op_luna_stellare",
      {
        id: "op_luna_stellare",
        stageName: "Luna Stellare",
        services: {
          emailEnabled: true,
          emailPrice: 25,
        },
      },
    ],
  ])

  return mockOperators.get(operatorId) || null
}

export async function submitWrittenConsultation(formData: FormData) {
  const clientId = formData.get("clientId") as string
  const operatorId = formData.get("operatorId") as string
  const question = formData.get("question") as string

  if (!clientId || !operatorId || !question) {
    return { success: false, error: "Dati mancanti per la richiesta." }
  }

  const operator = await getOperatorById(operatorId)
  if (!operator || !operator.services.emailEnabled || !operator.services.emailPrice) {
    return { success: false, error: "Operatore non disponibile per consulenze scritte." }
  }

  const cost = operator.services.emailPrice
  const clientWallet = mockUserWallets.get(clientId) || 0

  if (clientWallet < cost) {
    return { success: false, error: "Credito insufficiente nel wallet." }
  }

  mockUserWallets.set(clientId, clientWallet - cost)

  const newConsultation: WrittenConsultation = {
    id: `wc_${Date.now()}`,
    clientId,
    clientName: "Mario Rossi",
    operatorId,
    operatorName: operator.stageName,
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

  return { success: true, message: "La tua domanda è stata inviata con successo!" }
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
    return { success: false, error: "Dati mancanti per la risposta." }
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

  return { success: true, message: "Risposta inviata con successo!" }
}
