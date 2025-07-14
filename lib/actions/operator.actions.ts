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

// Funzione per l'admin per creare un operatore
export async function createOperator(operatorData: any) {
  const supabaseAdmin = createAdminClient()

  const {
    email,
    name,
    surname,
    stageName,
    phone,
    bio,
    avatarUrl,
    status,
    isOnline,
    commission,
    services,
    availability,
    specialties,
    categories,
  } = operatorData

  const password = Math.random().toString(36).slice(-12) // Genera una password sicura
  let userId: string | undefined = undefined

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // L'admin crea utenti già confermati
      user_metadata: {
        full_name: `${name} ${surname}`.trim(),
        stage_name: stageName,
        role: "operator",
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

    const profileUpdate = {
      full_name: `${name || ""} ${surname || ""}`.trim(),
      name: name || "",
      surname: surname || "",
      stage_name: stageName || "",
      phone: phone || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
      role: "operator" as const,
      status: status || "In Attesa",
      is_online: isOnline || false,
      commission_rate: safeParseFloat(commission),
      services: services || {},
      availability: availability || {},
      specialties: specialties || [],
      categories: categories || [],
    }

    const { error: updateError } = await supabaseAdmin.from("profiles").update(profileUpdate).eq("id", userId)

    if (updateError) {
      throw updateError
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
    console.error("Errore completo nella creazione dell'operatore:", error)
    return {
      success: false,
      message: `Errore durante la creazione dell'operatore: ${error.message}`,
    }
  }
}

// Funzione per l'admin per aggiornare la commissione
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
  } catch (error: any) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: `Errore nell'aggiornamento della commissione: ${error.message}`,
    }
  }
}

// Funzione per ottenere tutti gli operatori (usata in admin/operators)
export async function getAllOperators() {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator")
  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data
}

// Funzione per ottenere un operatore by ID (usata in admin/operators/[id]/edit)
export async function getOperatorById(id: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()
  if (error) {
    console.error(`Error fetching operator ${id}:`, error)
    return null
  }
  return data
}

// Funzione per l'operatore per ottenere il proprio profilo
export async function getMyOperatorProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "Utente non autenticato." }, profile: null }
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator profile:", error)
    return { error: { message: "Profilo operatore non trovato." }, profile: null }
  }

  return { profile, error: null }
}

// Funzione per l'operatore per aggiornare il proprio profilo
export async function updateMyOperatorProfile(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const profileFields = {
    name: formData.get("name") as string,
    surname: formData.get("surname") as string,
    stage_name: formData.get("stage_name") as string,
    phone: formData.get("phone") as string,
    bio: formData.get("bio") as string,
    specialties: formData.getAll("specialties").map(String),
  }

  const newPassword = formData.get("newPassword") as string

  const { error: profileError } = await supabase.from("profiles").update(profileFields).eq("id", user.id)

  if (profileError) {
    console.error("Error updating profile:", profileError)
    return { success: false, message: `Errore nell'aggiornamento del profilo: ${profileError.message}` }
  }

  if (newPassword) {
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
    if (passwordError) {
      console.error("Error updating password:", passwordError)
      revalidatePath("/(platform)/profile/operator")
      return { success: true, message: "Profilo aggiornato, ma la password non è stata cambiata. Riprova." }
    }
  }

  revalidatePath("/(platform)/profile/operator")
  if (profileFields.stage_name) {
    revalidatePath(`/(platform)/operator/${encodeURIComponent(profileFields.stage_name)}`)
  }

  return { success: true, message: "Profilo aggiornato con successo!" }
}
