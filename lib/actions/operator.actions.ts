"use server"

import { revalidatePath } from "next/cache"

// Mock data per operatori
const mockOperators = [
  {
    id: "op_luna_stellare",
    name: "Elara",
    surname: "Luna",
    stageName: "Luna Stellare",
    email: "stella@unveilly.com",
    phone: "+39 123 456 7890",
    bio: "Esperta in tarocchi e astrologia con oltre 10 anni di esperienza.",
    specialties: ["Tarocchi", "Amore", "Lavoro"],
    categories: ["Tarocchi"],
    avatarUrl: "/placeholder.svg?height=100&width=100",
    services: {
      chatEnabled: true,
      chatPrice: 2.5,
      callEnabled: true,
      callPrice: 3.0,
      emailEnabled: true,
      emailPrice: 30.0,
    },
    availability: {
      monday: ["09:00-12:00", "15:00-18:00"],
      tuesday: ["09:00-12:00", "15:00-18:00"],
      wednesday: ["09:00-12:00"],
      thursday: ["15:00-18:00"],
      friday: ["09:00-12:00", "15:00-18:00"],
      saturday: ["10:00-16:00"],
      sunday: [],
    },
    status: "Attivo" as const,
    isOnline: true,
    commission: "15",
    createdAt: "2025-05-20",
  },
  {
    id: "op_sol_divino",
    name: "Orion",
    surname: "Astro",
    stageName: "Sol Divino",
    email: "orion@unveilly.com",
    phone: "+39 123 456 7891",
    bio: "Specialista in astrologia e lettura delle stelle.",
    specialties: ["Astrologia", "Futuro", "Destino"],
    categories: ["Astrologia"],
    avatarUrl: "/placeholder.svg?height=100&width=100",
    services: {
      chatEnabled: true,
      chatPrice: 3.0,
      callEnabled: true,
      callPrice: 3.5,
      emailEnabled: true,
      emailPrice: 40.0,
    },
    availability: {
      monday: ["09:00-12:00", "15:00-18:00"],
      tuesday: ["09:00-12:00", "15:00-18:00"],
      wednesday: ["09:00-12:00", "15:00-18:00"],
      thursday: ["09:00-12:00", "15:00-18:00"],
      friday: ["09:00-12:00", "15:00-18:00"],
      saturday: ["10:00-16:00"],
      sunday: ["10:00-16:00"],
    },
    status: "Attivo" as const,
    isOnline: true,
    commission: "15",
    createdAt: "2025-04-10",
  },
]

export async function createOperator(operatorData: any) {
  try {
    // Simula creazione operatore
    const newOperator = {
      ...operatorData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString().split("T")[0],
    }

    // In un'app reale, salveresti nel database
    console.log("Operatore creato:", newOperator)

    revalidatePath("/admin/operators")

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      operator: newOperator,
    }
  } catch (error) {
    console.error("Errore creazione operatore:", error)
    return {
      success: false,
      message: "Errore nella creazione dell'operatore",
    }
  }
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  try {
    // Simula aggiornamento commissione
    console.log(`Aggiornamento commissione operatore ${operatorId}: ${commission}%`)

    revalidatePath("/admin/operators")
    revalidatePath(`/admin/operators/${operatorId}/edit`)

    return {
      success: true,
      message: "Commissione aggiornata con successo!",
    }
  } catch (error) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento della commissione",
    }
  }
}

export async function getAllOperators() {
  // Simula fetch operatori
  return mockOperators
}

export async function getOperatorById(id: string) {
  return mockOperators.find((op) => op.id === id) || null
}
