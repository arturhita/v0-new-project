"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient()

  try {
    // Controllo di sicurezza: verifica che l'utente che esegue l'azione sia un admin
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, message: "Devi essere loggato per eseguire questa azione." }
    }
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", currentUser.id)
      .single()

    if (adminProfileError || adminProfile?.role !== "admin") {
      return { success: false, message: "Non hai i permessi per creare un operatore." }
    }

    // 1. Genera una password temporanea sicura
    const temporaryPassword = randomBytes(16).toString("hex")

    // 2. Crea l'utente direttamente con email e password
    const {
      data: { user },
      error: createUserError,
    } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true, // Conferma automaticamente l'email
      user_metadata: {
        full_name: `${operatorData.name} ${operatorData.surname}`,
      },
    })

    if (createUserError || !user) {
      console.error("Error creating operator user:", createUserError?.message)
      if (createUserError?.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      return { success: false, message: "Errore nella creazione dell'utente operatore." }
    }

    // 3. Preparare i dati per l'inserimento nella tabella 'profiles'
    const profileData = {
      id: user.id,
      role: "operator" as const,
      full_name: `${operatorData.name} ${operatorData.surname}`,
      stage_name: operatorData.stageName,
      email: operatorData.email,
      phone_number: operatorData.phone,
      bio: operatorData.bio,
      profile_image_url: operatorData.avatarUrl, // FIX: Changed avatar_url to profile_image_url
      specializations: operatorData.categories,
      is_available: operatorData.isOnline,
      commission_rate: Number.parseFloat(operatorData.commission),
      service_prices: {
        chat: operatorData.services.chatEnabled ? Number.parseFloat(operatorData.services.chatPrice) : null,
        call: operatorData.services.callEnabled ? Number.parseFloat(operatorData.services.callPrice) : null,
        email: operatorData.services.emailEnabled ? Number.parseFloat(operatorData.services.emailPrice) : null,
      },
      availability_schedule: operatorData.availability,
    }

    // 4. Inserire il profilo nella tabella 'profiles'
    const { error: profileError } = await supabase.from("profiles").insert(profileData)

    if (profileError) {
      console.error("Error creating operator profile:", profileError.message)
      await supabase.auth.admin.deleteUser(user.id)
      return { success: false, message: "Errore nella creazione del profilo operatore." }
    }

    revalidatePath("/admin/operators")
    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword, // Restituisce la password per mostrarla all'admin
    }
  } catch (error) {
    console.error("Unexpected error in createOperator:", error)
    return { success: false, message: "Un errore imprevisto è accaduto." }
  }
}

// Funzioni esistenti per recuperare gli operatori
export async function getOperators(options?: {
  limit?: number
  category?: string
}): Promise<Profile[]> {
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      stage_name,
      bio,
      specializations,
      is_available,
      profile_image_url, 
      service_prices,
      average_rating,
      review_count 
    `,
    )
    .eq("role", "operator")

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.category) {
    query = query.contains("specializations", [options.category.charAt(0).toUpperCase() + options.category.slice(1)])
  }

  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }

  return data as Profile
}

export async function getOperatorById(id: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching operator by ID ${id}:`, error.message)
    return null
  }

  return data as Profile
}
