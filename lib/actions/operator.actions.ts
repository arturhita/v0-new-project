"use server"

import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import type { PostgrestError } from "@supabase/supabase-js"

interface OperatorData {
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
  availability: object
  status: "Attivo" | "In Attesa" | "Sospeso"
  isOnline: boolean
  commission: string
}

export async function createOperator(operatorData: OperatorData) {
  const supabase = createServerClient()

  try {
    // 1. Creare l'utente in Supabase Auth e inviare l'invito
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      email_confirm: true, // Invia un'email di invito per impostare la password
    })

    if (authError) {
      console.error("Errore creazione utente in Supabase Auth:", authError.message)
      // Controlla se l'utente esiste già
      if (authError.message.includes("already registered")) {
        return {
          success: false,
          message: "Un utente con questa email è già registrato.",
        }
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error("Creazione utente fallita, nessun utente restituito.")
    }

    const userId = authData.user.id

    // 2. Creare il profilo nel database pubblico
    const profileData = {
      id: userId,
      full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
      name: operatorData.name,
      surname: operatorData.surname,
      stage_name: operatorData.stageName,
      email: operatorData.email,
      phone: operatorData.phone,
      bio: operatorData.bio,
      avatar_url: operatorData.avatarUrl,
      role: "operator" as const,
      status: operatorData.status,
      commission_rate: Number.parseFloat(operatorData.commission),
      services: {
        chat: {
          enabled: operatorData.services.chatEnabled,
          price_per_minute: Number.parseFloat(operatorData.services.chatPrice),
        },
        call: {
          enabled: operatorData.services.callEnabled,
          price_per_minute: Number.parseFloat(operatorData.services.callPrice),
        },
        email: {
          enabled: operatorData.services.emailEnabled,
          price: Number.parseFloat(operatorData.services.emailPrice),
        },
      },
      availability: operatorData.availability,
      specialties: operatorData.specialties,
      categories: operatorData.categories,
      is_online: operatorData.isOnline,
    }

    const { error: profileError } = await supabase.from("profiles").insert(profileData)

    if (profileError) {
      console.error("Errore inserimento profilo in DB:", profileError)
      // Se l'inserimento del profilo fallisce, dovremmo eliminare l'utente appena creato per consistenza
      await supabase.auth.admin.deleteUser(userId)
      throw profileError
    }

    // 3. Riconvalida le pagine per mostrare i nuovi dati
    revalidatePath("/admin/operators")
    revalidatePath("/") // Riconvalida anche la homepage per mostrare i nuovi operatori

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo! È stato inviato un invito via email.`,
      operator: { id: userId, ...profileData },
    }
  } catch (error) {
    const errorMessage = (error as Error | PostgrestError).message
    console.error("Errore nel processo di creazione operatore:", errorMessage)
    return {
      success: false,
      message: `Errore nella creazione dell'operatore: ${errorMessage}`,
    }
  }
}

// Manteniamo le altre funzioni per compatibilità, ma andrebbero anch'esse aggiornate
// per usare Supabase invece dei dati mock.

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
]

export async function updateOperatorCommission(operatorId: string, commission: string) {
  const supabase = createServerClient()
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ commission_rate: Number.parseFloat(commission) })
      .eq("id", operatorId)

    if (error) throw error

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
  const supabase = createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getOperatorById(id: string) {
  const supabase = createServerClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  return data
}
