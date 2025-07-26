"use server"

import { revalidatePath } from "next/cache"

const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

type OperatorData = {
  name: string
  surname: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  avatarUrl: string
  services: {
    chatEnabled: boolean
    chatPrice: string
    callEnabled: boolean
    callPrice: string
    emailEnabled: boolean
    emailPrice: string
  }
  availability: any
  status: "Attivo" | "In Attesa" | "Sospeso"
  isOnline: boolean
  commission: string
}

// Mock operators database
const mockOperators = new Map<string, any>()

export async function createOperator(operatorData: OperatorData) {
  try {
    const operatorId = `op_${Date.now()}`

    const operator = {
      id: operatorId,
      full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
      stage_name: operatorData.stageName,
      email: operatorData.email,
      phone: operatorData.phone,
      bio: operatorData.bio,
      avatar_url: operatorData.avatarUrl,
      role: "operator",
      status: operatorData.status,
      is_online: operatorData.isOnline,
      commission_rate: safeParseFloat(operatorData.commission),
      specialties: operatorData.specialties,
      categories: operatorData.categories,
      availability: operatorData.availability,
      services: {
        chat: {
          enabled: operatorData.services.chatEnabled,
          price_per_minute: safeParseFloat(operatorData.services.chatPrice),
        },
        call: {
          enabled: operatorData.services.callEnabled,
          price_per_minute: safeParseFloat(operatorData.services.callPrice),
        },
        email: {
          enabled: operatorData.services.emailEnabled,
          price: safeParseFloat(operatorData.services.emailPrice),
        },
      },
      created_at: new Date().toISOString(),
    }

    mockOperators.set(operatorId, operator)

    revalidatePath("/admin/operators")
    revalidatePath(`/operator/${operatorData.stageName}`)

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: "temp123456",
    }
  } catch (error: any) {
    console.error("Errore nel processo di creazione operatore:", error)
    return {
      success: false,
      message: error.message || "Si è verificato un errore sconosciuto.",
    }
  }
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  try {
    const operator = mockOperators.get(operatorId)
    if (!operator) {
      return {
        success: false,
        message: "Operatore non trovato",
      }
    }

    operator.commission_rate = safeParseFloat(commission)
    mockOperators.set(operatorId, operator)

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

export async function getOperatorPublicProfile(username: string) {
  console.log(`[DB-FETCH] Ricerca profilo per stage_name: "${username}"`)

  const operator = Array.from(mockOperators.values()).find(
    (op) => op.stage_name?.toLowerCase() === username.toLowerCase() && op.status === "Attivo",
  )

  if (!operator) {
    console.error(`[DB-FETCH] Profilo non trovato per "${username}"`)
    return null
  }

  console.log(`[DB-FETCH] Profilo trovato per "${username}". ID: ${operator.id}`)

  const services = operator.services as any
  const combinedData = {
    id: operator.id,
    full_name: operator.full_name,
    stage_name: operator.stage_name,
    avatar_url: operator.avatar_url,
    bio: operator.bio,
    specialization: operator.specialties || [],
    tags: operator.categories || [],
    rating: operator.average_rating || 0,
    reviews_count: operator.reviews_count || 0,
    is_online: operator.is_online,
    availability: operator.availability,
    services: [
      services?.chat?.enabled && {
        service_type: "chat",
        price: services.chat.price_per_minute,
      },
      services?.call?.enabled && {
        service_type: "call",
        price: services.call.price_per_minute,
      },
      services?.email?.enabled && {
        service_type: "written",
        price: services.email.price,
      },
    ].filter(Boolean),
    reviews: [],
  }

  return combinedData
}

export async function getAllOperators() {
  return Array.from(mockOperators.values())
}

export async function getOperatorById(id: string) {
  return mockOperators.get(id) || null
}

export async function registerOperator(operatorData: any) {
  return createOperator(operatorData)
}

export async function updateOperatorProfile(
  userId: string,
  profileData: {
    full_name?: string
    bio?: string
    specialization?: string[]
    tags?: string[]
  },
) {
  try {
    const operator = mockOperators.get(userId)
    if (!operator) {
      return { error: "Operatore non trovato." }
    }

    Object.assign(operator, profileData)
    mockOperators.set(userId, operator)

    if (operator.stage_name) {
      revalidatePath(`/operator/${operator.stage_name}`)
    }
    revalidatePath("/(platform)/dashboard/operator/profile")

    return { data: operator }
  } catch (error) {
    console.error("Error updating operator profile:", error)
    return { error: "Impossibile aggiornare il profilo." }
  }
}

export async function updateOperatorAvailability(userId: string, availability: any) {
  try {
    const operator = mockOperators.get(userId)
    if (!operator) {
      return { error: "Operatore non trovato." }
    }

    operator.availability = availability
    mockOperators.set(userId, operator)

    if (operator.stage_name) {
      revalidatePath(`/operator/${operator.stage_name}`)
    }
    revalidatePath("/(platform)/dashboard/operator/availability")

    return { data: operator }
  } catch (error) {
    console.error("Error updating availability:", error)
    return { error: "Impossibile aggiornare la disponibilità." }
  }
}
