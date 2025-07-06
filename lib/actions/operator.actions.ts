"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient()

  try {
    // 1. Verifica che l'utente corrente sia un admin
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

    // 2. Genera una password temporanea sicura
    const temporaryPassword = randomBytes(16).toString("hex")

    // 3. Crea l'utente nel sistema di autenticazione di Supabase
    const {
      data: { user },
      error: createUserError,
    } = await supabase.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true, // L'utente non dovrà confermare l'email
      user_metadata: {
        full_name: operatorData.fullName,
      },
    })

    if (createUserError || !user) {
      console.error("Error creating operator user:", createUserError?.message)
      if (createUserError?.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      return { success: false, message: `Errore nella creazione dell'utente: ${createUserError?.message}` }
    }

    // 4. Aggiorna il profilo dell'utente (creato dal trigger) con i dati dell'operatore
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        role: "operator" as const,
        full_name: operatorData.fullName,
        stage_name: operatorData.stageName,
        bio: operatorData.bio,
        profile_image_url: operatorData.avatarUrl,
        is_available: operatorData.isOnline,
        service_prices: {
          chat: Number.parseFloat(operatorData.services.chatPrice),
          call: Number.parseFloat(operatorData.services.callPrice),
          email: Number.parseFloat(operatorData.services.emailPrice),
        },
        commission_rate: Number.parseFloat(operatorData.commission),
        availability_schedule: operatorData.availability,
        status: operatorData.status,
        phone: operatorData.phone,
        main_discipline: operatorData.categories.length > 0 ? operatorData.categories[0] : null,
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Error updating operator profile:", profileError.message)
      // Rollback: se l'aggiornamento del profilo fallisce, elimina l'utente appena creato
      await supabase.auth.admin.deleteUser(user.id)
      return { success: false, message: `Errore nell'aggiornamento del profilo: ${profileError.message}` }
    }

    // 5. Associa le categorie all'operatore
    if (operatorData.categories && operatorData.categories.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, slug")
        .in("name", operatorData.categories) // Cerca per nome, non per slug

      if (categoriesError) {
        console.error("Error fetching categories for association:", categoriesError.message)
      } else if (categoriesData) {
        const associations = categoriesData.map((cat) => ({
          operator_id: user.id,
          category_id: cat.id,
        }))
        const { error: associationError } = await supabase.from("operator_categories").insert(associations)

        if (associationError) {
          console.error("Error creating operator category associations:", associationError.message)
        }
      }
    }

    // 6. Invalida la cache per aggiornare le liste di operatori
    revalidatePath("/admin/operators")
    revalidatePath("/")

    // 7. Restituisci successo e password temporanea
    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error) {
    console.error("Unexpected error in createOperator:", error)
    return { success: false, message: "Un errore imprevisto è accaduto." }
  }
}

export async function getOperators(options?: { limit?: number; category?: string }): Promise<Profile[]> {
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      stage_name,
      bio,
      is_available,
      profile_image_url, 
      service_prices,
      average_rating,
      review_count,
      categories ( name, slug )
    `,
    )
    .eq("role", "operator")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  const profiles = data.map((profile) => ({
    ...profile,
    // @ts-ignore
    specializations: profile.categories.map((cat) => cat.name),
  }))

  return profiles as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        categories ( name, slug )
    `,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }

  const profile = {
    ...data,
    // @ts-ignore
    specializations: data.categories.map((cat) => cat.name),
  }

  return profile as Profile
}

export async function getOperatorById(id: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select(
      `
        *,
        categories ( name, slug )
    `,
    )
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching operator by ID ${id}:`, error.message)
    return null
  }

  const profile = {
    ...data,
    // @ts-ignore
    specializations: data.categories.map((cat) => cat.name),
  }

  return data as Profile
}

export async function getOperatorDashboardData(operatorId: string) {
  if (!operatorId) {
    return { success: false, message: "Operator ID is required." }
  }

  const supabase = createClient()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  try {
    // 1. Guadagni del mese corrente
    const { data: earningsData, error: earningsError } = await supabase
      .from("earnings")
      .select("net_earning")
      .eq("operator_id", operatorId)
      .gte("created_at", firstDayOfMonth)

    if (earningsError) throw new Error(`Error fetching earnings: ${earningsError.message}`)
    const monthlyEarnings = earningsData.reduce((sum, record) => sum + record.net_earning, 0)

    // 2. Numero di consulti completati nel mese
    const { count: consultationsCount, error: consultationsError } = await supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", operatorId)
      .eq("status", "completed")
      .gte("created_at", firstDayOfMonth)

    if (consultationsError) throw new Error(`Error fetching consultations count: ${consultationsError.message}`)

    // 3. Messaggi non letti
    const { count: unreadMessagesCount, error: messagesError } = await supabase
      .from("messages")
      .select("*", { count: "exact", head: true })
      .eq("receiver_id", operatorId)
      .eq("is_read", false)

    if (messagesError) throw new Error(`Error fetching unread messages count: ${messagesError.message}`)

    return {
      success: true,
      data: {
        monthlyEarnings,
        consultationsCount: consultationsCount ?? 0,
        unreadMessagesCount: unreadMessagesCount ?? 0,
      },
    }
  } catch (error) {
    console.error("Error in getOperatorDashboardData:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred."
    return { success: false, message: errorMessage, data: null }
  }
}

// Funzione per ottenere tutti gli operatori per la tabella di amministrazione
export async function getAllOperatorsForAdmin() {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_operators_view")
    .select("*")
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching operators for admin:", error)
    throw new Error("Impossibile caricare gli operatori.")
  }
  return data
}

// Funzione per ottenere i dettagli completi di un operatore per la pagina di modifica
export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()

  if (error) {
    console.error(`Error fetching operator ${operatorId} for edit:`, error)
    throw new Error("Operatore non trovato o errore nel caricamento.")
  }
  return data
}

// Funzione per aggiornare il profilo di un operatore
export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabase = createClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: profileData.full_name,
      stage_name: profileData.stage_name,
      phone: profileData.phone,
      main_discipline: profileData.main_discipline,
      bio: profileData.bio,
      is_available: profileData.is_available,
      status: profileData.status,
    })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error updating profile for operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento del profilo." }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

// Funzione per aggiornare la commissione di un operatore
export async function updateOperatorCommission(operatorId: string, commission: number) {
  const supabase = createClient()

  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }

  const { error } = await supabase.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) {
    console.error(`Error updating commission for operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento della commissione." }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

// Funzione per sospendere un operatore
export async function suspendOperator(operatorId: string) {
  const supabase = createClient()
  const { error } = await supabase
    .from("profiles")
    .update({ status: "suspended", is_available: false })
    .eq("id", operatorId)

  if (error) {
    console.error(`Error suspending operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante la sospensione." }
  }

  revalidatePath("/admin/operators")
  return { success: true, message: "Operatore sospeso." }
}
