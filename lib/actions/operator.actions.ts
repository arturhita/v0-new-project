"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

// Schema di validazione per i dati del form
const OperatorSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
})

export type OperatorState = {
  errors?: {
    email?: string[]
    password?: string[]
    fullName?: string[]
    stageName?: string[]
    server?: string[]
  }
  message?: string | null
  success?: boolean
}

export async function createOperator(prevState: OperatorState, formData: FormData): Promise<OperatorState> {
  // 1. Validazione dei dati del form
  const validatedFields = OperatorSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    stageName: formData.get("stageName"),
  })

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Errore di validazione. Controlla i campi inseriti.",
      success: false,
    }
  }

  const { email, password, fullName, stageName } = validatedFields.data
  const supabaseAdmin = createSupabaseAdminClient()

  try {
    // 2. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        role: "operator",
        full_name: fullName,
        stage_name: stageName,
      },
    })

    if (authError) {
      if (authError.message.includes("User already registered")) {
        return { errors: { email: ["Questo indirizzo email è già registrato."] }, success: false }
      }
      throw new Error(`Errore Auth: ${authError.message}`)
    }

    if (!authData.user) {
      throw new Error("Creazione utente auth fallita, nessun utente restituito.")
    }
    const newUserId = authData.user.id

    // 3. Inserimento del profilo nella tabella 'profiles'
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: email,
      role: "operator",
      full_name: fullName,
      stage_name: stageName,
    })

    if (profileError) {
      // Rollback: se l'inserimento del profilo fallisce, eliminiamo l'utente auth.
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      throw new Error(`Errore Profilo: ${profileError.message}`)
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto del server."
    return {
      errors: { server: [errorMessage] },
      message: "Si è verificato un errore imprevisto.",
      success: false,
    }
  }

  // 4. Successo
  revalidatePath("/admin/operators")
  redirect("/admin/operators?success=true")
}

// FUNZIONI RIPRISTINATE

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
  const supabaseAdmin = createSupabaseAdminClient()
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
  const supabaseAdmin = createSupabaseAdminClient()
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
  const supabaseAdmin = createSupabaseAdminClient()
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
