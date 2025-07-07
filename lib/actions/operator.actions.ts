"use server"

import { revalidatePath } from "next/cache"
import { randomBytes } from "crypto"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type { Profile } from "@/contexts/auth-context"

// NOTA: L'upload dell'avatar è stato temporaneamente rimosso per risolvere il bug principale del salvataggio.
// Verrà reintrodotto non appena questa versione sarà confermata funzionante.

export async function createOperator(operatorData: any) {
  console.log("Azione 'createOperator' avviata.")
  const supabase = createClient()

  try {
    // 1. Check Admin Permissions
    console.log("Step 1: Verifica permessi admin...")
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    if (!currentUser) {
      return { success: false, message: "Autenticazione richiesta." }
    }
    const { data: adminProfile } = await supabase.from("profiles").select("role").eq("id", currentUser.id).single()
    if (adminProfile?.role !== "admin") {
      return { success: false, message: "Non hai i permessi per creare un operatore." }
    }
    console.log("Permessi admin verificati.")

    // 2. Validate and Sanitize Data
    console.log("Step 2: Validazione e pulizia dati...")
    const email = operatorData.email?.trim()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { success: false, message: "Formato email non valido." }
    }
    const fullName = operatorData.fullName?.trim()
    if (!fullName) return { success: false, message: "Il nome completo è obbligatorio." }
    const stageName = operatorData.stageName?.trim()
    if (!stageName) return { success: false, message: "Il nome d'arte è obbligatorio." }

    const commission = Number.parseFloat(operatorData.commission)
    if (isNaN(commission) || commission < 0 || commission > 100) {
      return { success: false, message: "La commissione deve essere un numero valido tra 0 e 100." }
    }

    const services = {
      chatEnabled: !!operatorData.services?.chatEnabled,
      chatPrice: Number.parseFloat(operatorData.services?.chatPrice || "0"),
      callEnabled: !!operatorData.services?.callEnabled,
      callPrice: Number.parseFloat(operatorData.services?.callPrice || "0"),
      emailEnabled: !!operatorData.services?.emailEnabled,
      emailPrice: Number.parseFloat(operatorData.services?.emailPrice || "0"),
    }
    console.log("Dati validati con successo.")

    // 3. Create Auth User with metadata for the trigger
    console.log(`Step 3: Creazione utente auth per ${email}...`)
    const temporaryPassword = randomBytes(12).toString("hex")
    const {
      data: { user },
      error: createUserError,
    } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: temporaryPassword,
      email_confirm: true,
      user_metadata: {
        role: "operator", // Passa il ruolo al trigger
        full_name: fullName, // Passa il nome al trigger
        stage_name: stageName, // Passa il nome d'arte al trigger
      },
    })

    if (createUserError) {
      console.error("Errore durante la creazione dell'utente in Supabase Auth:", createUserError.message)
      if (createUserError.message.includes("already registered")) {
        return { success: false, message: "Un utente con questa email è già registrato." }
      }
      throw createUserError
    }
    if (!user) throw new Error("Creazione utente fallita senza un errore specifico.")
    console.log(`Utente auth e profilo base creati dal trigger con ID: ${user.id}`)

    // 4. Update Profile with remaining details
    console.log(`Step 4: Aggiornamento profilo con dettagli aggiuntivi per l'utente ${user.id}...`)
    const profileToUpdate = {
      phone: operatorData.phone || null,
      bio: operatorData.bio || null,
      specialties: operatorData.specialties || [],
      main_discipline: operatorData.categories?.[0] || null,
      service_prices: services,
      availability_schedule: operatorData.availability || {},
      status: operatorData.status || "In Attesa",
      is_online: operatorData.isOnline === true,
      commission_rate: commission,
    }
    const { error: updateProfileError } = await supabaseAdmin.from("profiles").update(profileToUpdate).eq("id", user.id)

    if (updateProfileError) {
      console.error("ERRORE CRITICO durante l'aggiornamento del profilo:", updateProfileError.message)
      console.log(`Tentativo di rollback: eliminazione utente auth ${user.id}...`)
      await supabaseAdmin.auth.admin.deleteUser(user.id)
      console.log("Rollback completato.")
      throw new Error(`Fallimento critico: impossibile aggiornare il profilo. ${updateProfileError.message}`)
    }
    console.log("Profilo aggiornato con successo.")

    // 5. Revalidate and Return Success
    console.log("Step 5: Revalidazione cache e invio risposta di successo...")
    revalidatePath("/admin/operators")
    console.log("Azione 'createOperator' completata con successo.")
    return {
      success: true,
      message: `Operatore ${stageName} creato con successo!`,
      temporaryPassword: temporaryPassword,
    }
  } catch (error: any) {
    console.error("ERRORE IMPREVISTO nel blocco catch principale di 'createOperator':", error)
    return { success: false, message: error.message || "Un errore imprevisto è accaduto durante la creazione." }
  }
}

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
    .eq("status", "Attivo")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
    throw new Error(`Error fetching operators: ${error.message}`)
  }

  if (!data) {
    return []
  }

  const profiles = data.map((profile: any) => ({
    ...profile,
    specializations: profile.categories ? profile.categories.map((cat: any) => cat.name) : [],
  }))

  return profiles as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
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
        status,
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

  if (!data) {
    return null
  }

  const profile = {
    ...data,
    specializations: (data as any).categories ? (data as any).categories.map((cat: any) => cat.name) : [],
  }

  return profile as Profile
}

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()

  if (error) {
    console.error(`Error fetching operator ${operatorId} for edit:`, error)
    throw new Error("Operatore non trovato o errore nel caricamento.")
  }
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const { error } = await supabaseAdmin
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

export async function updateOperatorCommission(operatorId: string, commission: number) {
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }

  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) {
    console.error(`Error updating commission for operator ${operatorId}:`, error)
    return { success: false, message: "Errore durante l'aggiornamento della commissione." }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

export async function suspendOperator(operatorId: string) {
  const { error } = await supabaseAdmin
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
