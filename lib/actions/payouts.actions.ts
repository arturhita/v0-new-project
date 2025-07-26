"use server"

import { revalidatePath } from "next/cache"

export interface PayoutRequest {
  id: string
  operatorId: string
  operatorName: string
  amount: number
  status: "pending" | "approved" | "rejected" | "processed"
  requestDate: Date
  processedDate?: Date
  notes?: string
  paymentMethod: "bank_transfer" | "paypal" | "stripe"
  bankDetails?: {
    iban: string
    bankName: string
    accountHolder: string
  }
}

// Mock payout requests
const mockPayoutRequests: PayoutRequest[] = [
  {
    id: "payout_1",
    operatorId: "op_luna_stellare",
    operatorName: "Luna Stellare",
    amount: 250.0,
    status: "pending",
    requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    paymentMethod: "bank_transfer",
    bankDetails: {
      iban: "IT60 X054 2811 1010 0000 0123 456",
      bankName: "Banca Intesa",
      accountHolder: "Luna Stellare",
    },
  },
  {
    id: "payout_2",
    operatorId: "op_sol_divino",
    operatorName: "Sol Divino",
    amount: 180.5,
    status: "approved",
    requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    processedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    paymentMethod: "paypal",
    notes: "Pagamento approvato e processato",
  },
]

export async function getPayoutRequests(status?: string) {
  try {
    let filteredRequests = mockPayoutRequests

    if (status && status !== "all") {
      filteredRequests = mockPayoutRequests.filter((request) => request.status === status)
    }

    return {
      success: true,
      requests: filteredRequests.sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime()),
    }
  } catch (error) {
    console.error("Error fetching payout requests:", error)
    return {
      success: false,
      requests: [],
    }
  }
}

export async function createPayoutRequest(
  operatorId: string,
  amount: number,
  paymentMethod: "bank_transfer" | "paypal" | "stripe",
  bankDetails?: any,
) {
  try {
    const newRequest: PayoutRequest = {
      id: `payout_${Date.now()}`,
      operatorId,
      operatorName: "Operatore", // This would come from the database
      amount,
      status: "pending",
      requestDate: new Date(),
      paymentMethod,
      bankDetails,
    }

    mockPayoutRequests.unshift(newRequest)

    revalidatePath("/admin/payouts")
    revalidatePath("/dashboard/operator/payouts")

    return {
      success: true,
      message: "Richiesta di pagamento creata con successo",
      requestId: newRequest.id,
    }
  } catch (error) {
    console.error("Error creating payout request:", error)
    return {
      success: false,
      message: "Errore nella creazione della richiesta di pagamento",
    }
  }
}

export async function approvePayoutRequest(requestId: string, notes?: string) {
  try {
    const request = mockPayoutRequests.find((r) => r.id === requestId)
    if (!request) {
      return {
        success: false,
        message: "Richiesta non trovata",
      }
    }

    request.status = "approved"
    request.processedDate = new Date()
    if (notes) request.notes = notes

    revalidatePath("/admin/payouts")

    return {
      success: true,
      message: "Richiesta di pagamento approvata",
    }
  } catch (error) {
    console.error("Error approving payout request:", error)
    return {
      success: false,
      message: "Errore nell'approvazione della richiesta",
    }
  }
}

export async function rejectPayoutRequest(requestId: string, reason: string) {
  try {
    const request = mockPayoutRequests.find((r) => r.id === requestId)
    if (!request) {
      return {
        success: false,
        message: "Richiesta non trovata",
      }
    }

    request.status = "rejected"
    request.processedDate = new Date()
    request.notes = reason

    revalidatePath("/admin/payouts")

    return {
      success: true,
      message: "Richiesta di pagamento rifiutata",
    }
  } catch (error) {
    console.error("Error rejecting payout request:", error)
    return {
      success: false,
      message: "Errore nel rifiuto della richiesta",
    }
  }
}

export async function processPayoutRequest(requestId: string) {
  try {
    const request = mockPayoutRequests.find((r) => r.id === requestId)
    if (!request) {
      return {
        success: false,
        message: "Richiesta non trovata",
      }
    }

    if (request.status !== "approved") {
      return {
        success: false,
        message: "La richiesta deve essere approvata prima di essere processata",
      }
    }

    request.status = "processed"
    request.processedDate = new Date()
    request.notes = "Pagamento processato con successo"

    revalidatePath("/admin/payouts")

    return {
      success: true,
      message: "Pagamento processato con successo",
    }
  } catch (error) {
    console.error("Error processing payout request:", error)
    return {
      success: false,
      message: "Errore nel processamento del pagamento",
    }
  }
}
