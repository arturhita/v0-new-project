"use server"

import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin" // Importa il nuovo client admin
import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"

// Helper function to map view data to component props
const mapOperatorData = (op: any) => ({
  id: op.id,
  name: op.stage_name,
  avatarUrl: op.profile_image_url,
  specialization: op.main_discipline,
  rating: op.average_rating,
  reviewsCount: op.review_count,
  description: op.bio,
  tags: op.specializations || [],
  isOnline: op.is_online,
  services: op.service_prices,
  joinedDate: op.joined_at,
  // Include any other fields needed by components
  fullName: op.full_name,
  status: op.status,
  availability: op.availability,
})

// Funzione per creare un nuovo operatore
export async function createOperator(operatorData: any) {
  const supabase = createClient() // Client per il contesto utente (per controllare i permessi)

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

    // 3. Crea l'utente usando il CLIENT ADMIN
    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: temporaryPassword,
      email_confirm: true,
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

    // 4. Aggiorna il profilo dell'utente con i dati dell'operatore usando il CLIENT ADMIN
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: user.id,
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

    if (profileError) {
      console.error("Error updating operator profile:", profileError.message)
      // Rollback: se l'aggiornamento del profilo fallisce, elimina l'utente appena creato
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      return { success: false, message: `Errore nell'aggiornamento del profilo: ${profileError.message}` }
    }

    // 5. Associa le categorie all'operatore usando il CLIENT ADMIN
    if (operatorData.categories && operatorData.categories.length > 0) {
      const { data: categoriesData, error: categoriesError } = await supabaseAdmin
        .from("categories")
        .select("id, slug")
        .in("name", operatorData.categories)

      if (categoriesError) {
        console.error("Error fetching categories for association:", categoriesError.message)
      } else if (categoriesData) {
        const associations = categoriesData.map((cat) => ({
          operator_id: user.id,
          category_id: cat.id,
        }))
        const { error: associationError } = await supabaseAdmin.from("operator_categories").insert(associations)

        if (associationError) {
          console.error("Error creating operator category associations:", associationError.message)
        }
      }
    }

    revalidatePath("/admin/operators")
    revalidatePath("/")

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

export async function getOperators(options?: { limit?: number; category?: string }): Promise<any[]> {
  const supabase = createClient()

  let query = supabase.from("operators_view").select("*")

  if (options?.category) {
    query = query.cs("category_slugs", `{${options.category}}`)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("is_online", { ascending: false }).order("joined_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
    throw new Error(`Error fetching operators: ${error.message}`)
  }

  return (data || []).map(mapOperatorData)
}

export async function getOperatorByStageName(stageName: string): Promise<any | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("operators_view").select("*").eq("stage_name", stageName).single()

  if (error) {
    console.error(`Error fetching operator by stage name ${stageName}:`, error.message)
    return null
  }

  return data ? mapOperatorData(data) : null
}

export async function getOperatorById(id: string): Promise<any | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("operators_view").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching operator by ID ${id}:`, error.message)
    return null
  }

  return data ? mapOperatorData(data) : null
}

export async function getOperatorDashboardData(operatorId: string) {
  if (!operatorId) {
    return { success: false, message: "Operator ID is required." }
  }

  const supabase = createClient()
  const now = new Date()
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  try {
    // This part of the code might need updates if table names like 'earnings' or 'consultations' changed.
    // Assuming they exist and are correct for now.
    const { data: earningsData, error: earningsError } = await supabase
      .from("earnings")
      .select("net_earning")
      .eq("operator_id", operatorId)
      .gte("created_at", firstDayOfMonth)

    if (earningsError) throw new Error(`Error fetching earnings: ${earningsError.message}`)
    const monthlyEarnings = earningsData.reduce((sum, record) => sum + record.net_earning, 0)

    const { count: consultationsCount, error: consultationsError } = await supabase
      .from("consultations")
      .select("*", { count: "exact", head: true })
      .eq("operator_id", operatorId)
      .eq("status", "completed")
      .gte("created_at", firstDayOfMonth)

    if (consultationsError) throw new Error(`Error fetching consultations count: ${consultationsError.message}`)

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
  const { error } = await supabaseAdmin // USARE CLIENT ADMIN
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
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }

  const { error } = await supabaseAdmin // USARE CLIENT ADMIN
    .from("profiles")
    .update({ commission_rate: commission })
    .eq("id", operatorId)

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
  const { error } = await supabaseAdmin // USARE CLIENT ADMIN
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
