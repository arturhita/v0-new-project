"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
// Gestisce stringhe vuote, null, undefined e non numeriche restituendo 0.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

// Questa interfaccia è solo per riferimento, l'azione ora usa FormData
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

export async function createOperator(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const surname = formData.get("surname") as string
  const stageName = formData.get("stageName") as string
  const password = Math.random().toString(36).slice(-12) // Genera una password sicura
  let userId: string | undefined = undefined

  try {
    // 1. Creazione dell'utente nel sistema di autenticazione di Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // L'utente è già verificato dall'admin
      user_metadata: {
        full_name: `${name} ${surname}`.trim(),
        stage_name: stageName,
      },
    })

    if (authError || !authData.user) {
      console.error("Errore nella creazione dell'utente in Supabase Auth:", authError)
      return {
        success: false,
        message: `Errore Supabase Auth: ${authError?.message || "Utente non creato."}`,
      }
    }

    userId = authData.user.id

    // Il trigger di Supabase ha già creato un profilo di base.
    // Ora lo aggiorniamo con i dati del form.

    // FASE 1: Aggiornamento dei dati "semplici" e sicuri
    const simpleDataToUpdate = {
      full_name: `${name || ""} ${surname || ""}`.trim(),
      name: name || "",
      surname: surname || "",
      stage_name: stageName || "",
      phone: formData.get("phone") as string | null,
      bio: formData.get("bio") as string | null,
      avatar_url: formData.get("avatarUrl") as string | null,
      role: "operator" as const,
      status: formData.get("status") as "Attivo" | "In Attesa" | "Sospeso",
      is_online: formData.get("isOnline") === "on",
    }

    console.log("FASE 1: Tentativo di aggiornamento con dati semplici:", JSON.stringify(simpleDataToUpdate, null, 2))
    const { error: simpleUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(simpleDataToUpdate)
      .eq("id", userId)

    if (simpleUpdateError) {
      console.error("!!! ERRORE DATABASE (AGGIORNAMENTO SEMPLICE):", simpleUpdateError)
      throw simpleUpdateError
    }
    console.log("FASE 1: Aggiornamento dati semplici riuscito.")

    // FASE 2: Aggiornamento dei dati "complessi" (JSONB, array, numeri)
    const complexDataToUpdate = {
      commission_rate: safeParseFloat(formData.get("commission")),
      services: {
        chat: {
          enabled: formData.get("services.chatEnabled") === "on",
          price_per_minute: safeParseFloat(formData.get("services.chatPrice")),
        },
        call: {
          enabled: formData.get("services.callEnabled") === "on",
          price_per_minute: safeParseFloat(formData.get("services.callPrice")),
        },
        email: {
          enabled: formData.get("services.emailEnabled") === "on",
          price: safeParseFloat(formData.get("services.emailPrice")),
        },
      },
      availability: JSON.parse((formData.get("availability") as string) || "{}"),
      specialties:
        (formData.get("specialties") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      categories:
        (formData.get("categories") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
    }

    console.log("FASE 2: Tentativo di aggiornamento con dati complessi:", JSON.stringify(complexDataToUpdate, null, 2))
    const { error: complexUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(complexDataToUpdate)
      .eq("id", userId)

    if (complexUpdateError) {
      console.error("!!! ERRORE DATABASE (AGGIORNAMENTO COMPLESSO):", complexUpdateError)
      throw complexUpdateError
    }
    console.log("FASE 2: Aggiornamento dati complessi riuscito.")

    revalidatePath("/admin/operators")
    return {
      success: true,
      message: `Operatore ${stageName} creato con successo!`,
      temporaryPassword: password,
    }
  } catch (error: any) {
    // Rollback
    if (userId) {
      console.log(`Rollback: tentativo di eliminazione utente Auth con ID: ${userId}`)
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log("Rollback completato.")
    }
    return {
      success: false,
      message: `Errore durante la creazione dell'operatore: ${error.message}`,
    }
  }
}
