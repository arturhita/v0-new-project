"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"
import { revalidatePath } from "next/cache"

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient()

  try {
    // 1. Invitare l'utente via email. Questo crea l'utente in auth.users
    // e gli invia un link per impostare la password.
    const {
      data: { user },
      error: inviteError,
    } = await supabase.auth.admin.inviteUserByEmail(operatorData.email, {
      data: {
        full_name: `${operatorData.name} ${operatorData.surname}`,
      },
    })

    if (inviteError || !user) {
      console.error("Error inviting operator:", inviteError?.message)
      // Fornisce un messaggio di errore più specifico se l'utente esiste già
      if (inviteError?.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      return { success: false, message: "Errore nella creazione dell'utente operatore." }
    }

    // 2. Preparare i dati per l'inserimento nella tabella 'profiles'
    const profileData = {
      id: user.id, // ID dall'utente appena creato
      role: "operator" as const,
      full_name: `${operatorData.name} ${operatorData.surname}`,
      stage_name: operatorData.stageName,
      email: operatorData.email,
      phone_number: operatorData.phone,
      bio: operatorData.bio,
      avatar_url: operatorData.avatarUrl,
      specializations: operatorData.categories, // Usiamo il campo categories del form per le specializzazioni
      is_available: operatorData.isOnline,
      commission_rate: Number.parseFloat(operatorData.commission),
      // Trasforma i dati del form in oggetti JSONB come richiesto dal DB
      service_prices: {
        chat: operatorData.services.chatEnabled ? Number.parseFloat(operatorData.services.chatPrice) : null,
        call: operatorData.services.callEnabled ? Number.parseFloat(operatorData.services.callPrice) : null,
        email: operatorData.services.emailEnabled ? Number.parseFloat(operatorData.services.emailPrice) : null,
      },
      availability_schedule: operatorData.availability,
    }

    // 3. Inserire il profilo nella tabella 'profiles'
    const { error: profileError } = await supabase.from("profiles").insert(profileData)

    if (profileError) {
      console.error("Error creating operator profile:", profileError.message)
      // Se l'inserimento del profilo fallisce, è buona norma eliminare l'utente auth creato
      await supabase.auth.admin.deleteUser(user.id)
      return { success: false, message: "Errore nella creazione del profilo operatore." }
    }

    // 4. Se tutto va bene, rivalida la cache e ritorna successo
    revalidatePath("/admin/operators")
    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo! È stato inviato un invito via email.`,
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
      avatar_url, 
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
