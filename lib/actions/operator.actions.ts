"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

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
    console.log("--- Inizio Processo Creazione Operatore ---")
    console.log("Dati ricevuti:", { email: operatorData.email, stageName: operatorData.stageName })

    // 1. Creare l'utente in Supabase Auth
    console.log("Passo 1: Creazione utente in Supabase Auth...")
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true,
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
    console.log(`Utente Auth creato con successo. ID: ${userId}`)

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
      avatar_url: operatorData.avatarUrl || null,
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

    console.log("Passo 2: Inserimento profilo nel database...")
    const { error: profileError } = await supabaseAdmin.from("profiles").insert(profileData)

    if (profileError) {
      console.error("!!! ERRORE Inserimento Profilo DB:", profileError.message)
      console.log(`Rollback: tentativo di eliminazione utente Auth con ID: ${userId}`)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log("Rollback completato.")
      throw profileError
    }

    console.log("Profilo inserito con successo nel database.")

    // 3. Riconvalida le pagine
    console.log("Passo 3: Riconvalida percorsi...")
    revalidatePath("/admin/operators")
    revalidatePath("/")
    console.log("--- Processo Creazione Operatore Completato con Successo ---")

    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error) {
    let errorMessage: string
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === "string") {
      errorMessage = error
    } else {
      errorMessage = "Errore sconosciuto. Controlla i log del server."
    }

    console.error("!!! ERRORE CRITICO nel processo di creazione operatore:", errorMessage)

    if (userId) {
      console.log(`Tentativo di rollback per utente ${userId} a causa di errore successivo...`)
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId)
        console.log(`Rollback per utente ${userId} completato.`)
      } catch (rollbackError) {
        console.error(`!!! FALLIMENTO ROLLBACK per utente ${userId}:`, rollbackError)
      }
    }

    return {
      success: false,
      message: `Errore nella creazione dell'operatore: ${errorMessage}`,
    }
  }
}

export async function updateOperatorCommission(operatorId: string, commission: string) {
  const supabase = createClient()
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
