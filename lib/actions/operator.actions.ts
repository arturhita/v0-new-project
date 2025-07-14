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

  const password = Math.random().toString(36).slice(-12)
  let userId: string | undefined = undefined

  try {
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
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
      is_online: isOnline,
      commission_rate: safeParseFloat(commission),
      services: {
        chat: {
          enabled: services.chatEnabled,
          price_per_minute: safeParseFloat(services.chatPrice),
        },
        call: {
          enabled: services.callEnabled,
          price_per_minute: safeParseFloat(services.callPrice),
        },
        email: {
          enabled: services.emailEnabled,
          price: safeParseFloat(services.emailPrice),
        },
      },
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

export async function getMyOperatorProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: { message: "Utente non autenticato." } }
  }

  const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).eq("role", "operator").single()

  if (error) {
    console.error("Error fetching operator profile:", error)
    return { error: { message: "Profilo operatore non trovato." } }
  }

  return { data }
}

export async function updateMyOperatorProfile(profileData: any) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const { newPassword, ...profileFields } = profileData

  const { error: profileError } = await supabase.from("profiles").update(profileFields).eq("id", user.id)

  if (profileError) {
    console.error("Error updating profile:", profileError)
    return { success: false, message: `Errore nell'aggiornamento del profilo: ${profileError.message}` }
  }

  if (newPassword) {
    const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword })
    if (passwordError) {
      console.error("Error updating password:", passwordError)
      revalidatePath("/profile/operator")
      return { success: true, message: "Profilo aggiornato, ma la password non è stata cambiata. Riprova." }
    }
  }

  revalidatePath("/profile/operator")
  if (profileFields.stage_name) {
    revalidatePath(`/operator/${encodeURIComponent(profileFields.stage_name)}`)
  }

  return { success: true, message: "Profilo aggiornato con successo!" }
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
