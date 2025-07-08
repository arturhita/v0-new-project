"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
// Gestisce stringhe vuote, null, undefined e non numeriche restituendo 0.
const safeParseFloat = (value: string | number | undefined | null): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

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
  const supabaseAdmin = createAdminClient()
  const temporaryPassword = Math.random().toString(36).slice(-12)
  let userId: string | undefined = undefined

  try {
    // 1. Creare l'utente in Supabase Auth.
    //    Il trigger 'on_auth_user_created' creerà automaticamente un profilo di base.
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true, // L'utente non dovrà confermare l'email
      user_metadata: {
        full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
        stage_name: operatorData.stageName,
      },
    })

    if (authError) {
      console.error("!!! ERRORE in Supabase Auth:", authError)
      if (authError.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      throw authError
    }

    if (!authData.user) {
      throw new Error("Creazione utente in Auth fallita, nessun utente restituito.")
    }

    userId = authData.user.id

    // Strategia di aggiornamento in due fasi per isolare l'errore

    // FASE 1: Aggiornamento dei dati "semplici" e sicuri
    const simpleDataToUpdate = {
      full_name: `${operatorData.name || ""} ${operatorData.surname || ""}`.trim(),
      name: operatorData.name || "",
      surname: operatorData.surname || "",
      stage_name: operatorData.stageName || "",
      phone: operatorData.phone || null,
      bio: operatorData.bio || null,
      avatar_url: operatorData.avatarUrl || null,
      role: "operator" as const,
      status: operatorData.status,
      is_online: operatorData.isOnline,
    }

    console.log("FASE 1: Tentativo di aggiornamento con dati semplici:", JSON.stringify(simpleDataToUpdate, null, 2))
    const { error: simpleUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(simpleDataToUpdate)
      .eq("id", userId)

    if (simpleUpdateError) {
      console.error("!!! ERRORE durante l'aggiornamento dei dati semplici:", simpleUpdateError)
      throw simpleUpdateError
    }
    console.log("FASE 1: Aggiornamento dati semplici riuscito.")

    // FASE 2: Aggiornamento dei dati "complessi" (JSONB, array, numeri)
    const complexDataToUpdate = {
      commission_rate: safeParseFloat(operatorData.commission),
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
      availability: operatorData.availability || {},
      specialties: operatorData.specialties || [],
      categories: operatorData.categories || [],
    }

    console.log("FASE 2: Tentativo di aggiornamento con dati complessi:", JSON.stringify(complexDataToUpdate, null, 2))
    const { error: complexUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(complexDataToUpdate)
      .eq("id", userId)

    if (complexUpdateError) {
      console.error("!!! ERRORE durante l'aggiornamento dei dati complessi:", complexUpdateError)
      throw complexUpdateError
    }
    console.log("FASE 2: Aggiornamento dati complessi riuscito.")

    // 3. Riconvalida i percorsi
    revalidatePath("/admin/operators")
    revalidatePath("/")

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error) {
    let errorMessage = "Si è verificato un errore imprevisto."
    let errorDetails = ""

    if (error && typeof error === "object" && "message" in error) {
      const dbError = error as { message: string; details?: string; hint?: string; code?: string }
      errorMessage = `Errore Database: ${dbError.message}`
      if (dbError.details) errorDetails += ` Dettagli: ${dbError.details}`
      if (dbError.hint) errorDetails += ` Suggerimento: ${dbError.hint}`
      console.error("!!! ERRORE DATABASE CATTURATO:", JSON.stringify(dbError, null, 2))
    } else if (error instanceof Error) {
      errorMessage = `Errore Applicazione: ${error.message}`
      console.error("!!! ERRORE GENERICO CATTURATO:", error)
    } else {
      errorMessage = "Errore di tipo sconosciuto."
      console.error("!!! ERRORE SCONOSCIUTO CATTURATO:", error)
    }

    // Rollback: se l'utente è stato creato ma l'aggiornamento è fallito, eliminiamolo.
    if (userId) {
      console.log(`Rollback: tentativo di eliminazione utente Auth con ID: ${userId}`)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log("Rollback completato.")
    }

    return {
      success: false,
      message: `${errorMessage}${errorDetails}`,
    }
  }
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  const supabase = createClient()
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ commission_rate: safeParseFloat(commission) })
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
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  return data
}
