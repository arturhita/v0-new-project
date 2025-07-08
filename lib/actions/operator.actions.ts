"use server"

import { createClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { v4 as uuidv4 } from "uuid"

// Funzione di utilità per sanificare i valori numerici
const parseSafeFloat = (value: any): number => {
  if (value === null || value === undefined || value === "") return 0
  const parsed = Number.parseFloat(value)
  return isNaN(parsed) ? 0 : parsed
}

export async function createOperator(formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const password = uuidv4().substring(0, 12) // Genera una password sicura

  // 1. Creazione dell'utente nel sistema di autenticazione di Supabase
  const { data: authData, error: authError } = await supabase.auth.createUser({
    email,
    password,
    email_confirm: true, // L'utente è già verificato dall'admin
    user_metadata: {
      name: name,
      role: "operator",
    },
  })

  if (authError || !authData.user) {
    console.error("Errore nella creazione dell'utente in Supabase Auth:", authError)
    return {
      success: false,
      error: `Errore Supabase Auth: ${authError?.message || "Utente non creato."}`,
    }
  }

  const userId = authData.user.id

  // Il trigger di Supabase ha già creato un profilo di base.
  // Ora lo aggiorniamo con i dati del form.

  // 2. Preparazione dei dati per l'aggiornamento del profilo
  const profileDataSimple = {
    name: name,
    bio: formData.get("bio") as string | null,
    commission_rate: parseSafeFloat(formData.get("commission_rate")),
    is_featured: formData.get("is_featured") === "on",
    is_online: false, // Default
    status: "pending_approval", // Default
  }

  const profileDataComplex = {
    services: {
      chat: {
        enabled: formData.get("services.chat.enabled") === "on",
        price_per_minute: parseSafeFloat(formData.get("services.chat.price_per_minute")),
      },
      call: {
        enabled: formData.get("services.call.enabled") === "on",
        price_per_minute: parseSafeFloat(formData.get("services.call.price_per_minute")),
      },
      video: {
        enabled: formData.get("services.video.enabled") === "on",
        price_per_minute: parseSafeFloat(formData.get("services.video.price_per_minute")),
      },
      written: {
        enabled: formData.get("services.written.enabled") === "on",
        price: parseSafeFloat(formData.get("services.written.price")),
      },
    },
    availability: JSON.parse((formData.get("availability") as string) || "{}"),
    specialties:
      (formData.get("specialties") as string)
        ?.split(",")
        .map((s) => s.trim())
        .filter(Boolean) || [],
  }

  console.log("--- Dati Semplici da Aggiornare ---")
  console.log(profileDataSimple)

  // 3. Primo aggiornamento con dati semplici
  const { error: simpleUpdateError } = await supabase.from("profiles").update(profileDataSimple).eq("id", userId)

  if (simpleUpdateError) {
    console.error("!!! ERRORE DATABASE (AGGIORNAMENTO SEMPLICE):", simpleUpdateError)
    return {
      success: false,
      error: `Errore DB (dati semplici): ${simpleUpdateError.message}`,
    }
  }

  console.log("--- Dati Complessi da Aggiornare ---")
  console.log(profileDataComplex)

  // 4. Secondo aggiornamento con dati complessi
  const { error: complexUpdateError } = await supabase.from("profiles").update(profileDataComplex).eq("id", userId)

  if (complexUpdateError) {
    console.error("!!! ERRORE DATABASE (AGGIORNAMENTO COMPLESSO):", complexUpdateError)
    // Qui l'errore corrotto si manifesterebbe
    return {
      success: false,
      error: `Errore DB (dati complessi): ${complexUpdateError.message}`,
    }
  }

  revalidatePath("/admin/operators")
  return {
    success: true,
    message: `Operatore ${name} creato con successo!`,
    tempPassword: password,
  }
}
