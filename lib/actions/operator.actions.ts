"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
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
    // 1. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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

    // FASE 1: Aggiornamento dati semplici
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

    const { error: simpleUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(simpleDataToUpdate)
      .eq("id", userId)

    if (simpleUpdateError) {
      throw simpleUpdateError
    }

    // FASE 2: Aggiornamento dati complessi
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

    const { error: complexUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(complexDataToUpdate)
      .eq("id", userId)

    if (complexUpdateError) {
      throw complexUpdateError
    }

    revalidatePath("/admin/operators")
    return {
      success: true,
      message: `Operatore ${stageName} creato con successo!`,
      temporaryPassword: password,
    }
  } catch (error: any) {
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
    }
    return {
      success: false,
      message: `Errore durante la creazione dell'operatore: ${error.message}`,
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

/**
 * Recupera il profilo pubblico completo di un operatore per la sua pagina vetrina.
 * Utilizza una funzione RPC del database per efficienza.
 * @param username - Lo username pubblico dell'operatore.
 * @returns Un oggetto contenente tutti i dati del profilo, o null se non trovato.
 */
export async function getOperatorPublicProfile(username: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc("get_operator_public_profile", {
    // CORREZIONE: usa il nuovo nome del parametro 'in_username'
    in_username: username,
  })

  if (error) {
    console.error("Error fetching operator profile:", error.message)
    return null
  }

  return data
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
