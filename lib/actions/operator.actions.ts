"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

// Schema di validazione completo
const OperatorInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(3),
  stageName: z.string().min(3),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number(),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.boolean(),
  categories: z.string().array().min(1),
  specialties: z.string().array(),
  services: z.object({
    chatEnabled: z.boolean(),
    chatPrice: z.coerce.number(),
    callEnabled: z.boolean(),
    callPrice: z.coerce.number(),
    emailEnabled: z.boolean(),
    emailPrice: z.coerce.number(),
  }),
  availability: z.any(),
  avatarUrl: z.string().optional(),
})

/**
 * VERSIONE DI DEBUG #2: Crea l'utente in Auth E inserisce il record in 'profiles'.
 * L'obiettivo è verificare che anche l'inserimento nel database funzioni.
 */
export async function createOperator(operatorData: z.infer<typeof OperatorInputSchema>) {
  console.log("--- [DEBUG TEST #2] --- Inizio azione: Auth + Profilo DB.")
  let newUserId: string | null = null

  try {
    // 1. Validazione
    const validation = OperatorInputSchema.safeParse(operatorData)
    if (!validation.success) {
      throw new Error(`Errore di validazione: ${JSON.stringify(validation.error.flatten().fieldErrors)}`)
    }
    const { avatarUrl, ...data } = validation.data
    console.log(`[DEBUG] Step 1: Dati validati per ${data.email}.`)

    const supabaseAdmin = createSupabaseAdminClient()

    // 2. Creazione utente in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: data.fullName, stage_name: data.stageName },
    })
    if (authError) throw new Error(`Errore Auth: ${authError.message}`)
    newUserId = authData.user.id
    console.log(`[DEBUG] Step 2: Utente Auth creato con successo: ${newUserId}`)

    // 3. Inserimento del profilo nel database
    console.log(`[DEBUG] Step 3: Tentativo di inserimento in 'profiles' per l'utente ${newUserId}...`)
    const { error: profileError } = await supabaseAdmin.from("profiles").insert({
      id: newUserId,
      email: data.email,
      role: "operator",
      full_name: data.fullName,
      stage_name: data.stageName,
      phone: data.phone,
      bio: data.bio,
      commission_rate: data.commission,
      status: data.status,
      is_online: data.isOnline,
      main_discipline: data.categories[0],
      specialties: data.specialties,
      service_prices: data.services,
      availability_schedule: data.availability,
      profile_image_url: null, // L'avatar verrà gestito dopo
    })

    if (profileError) {
      // Se questo fallisce, l'errore verrà lanciato e catturato dal blocco catch
      console.error("[DEBUG] Step 3 FALLITO: Errore durante l'inserimento nel DB.", profileError)
      throw new Error(`Errore Database: ${profileError.message}`)
    }
    console.log("[DEBUG] Step 3: Profilo inserito nel DB con successo.")

    // Se arriviamo qui, tutto è andato bene
    console.log("--- [DEBUG TEST #2] --- Azione completata con SUCCESSO.")
    revalidatePath("/admin/operators")
    return { success: true, message: "TEST #2 SUPERATO: Utente Auth e Profilo DB creati correttamente." }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto."
    console.error("--- [DEBUG TEST #2] --- CATTURATO ERRORE GRAVE:", errorMessage)

    // Rollback: se l'utente Auth è stato creato ma il profilo no, eliminiamo l'utente Auth.
    if (newUserId) {
      console.log(`[ROLLBACK] L'operazione è fallita. Tento di eliminare l'utente Auth orfano: ${newUserId}`)
      const supabaseAdminForRollback = createSupabaseAdminClient()
      await supabaseAdminForRollback.auth.admin.deleteUser(newUserId)
      console.log("[ROLLBACK] Utente Auth orfano eliminato con successo.")
    }

    return { success: false, message: `TEST #2 FALLITO: ${errorMessage}` }
  }
}

// --- LE ALTRE FUNZIONI RIMANGONO QUI SOTTO MA NON VENGONO MODIFICATE ---

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
      `id, full_name, stage_name, bio, is_available, is_online, profile_image_url, service_prices, average_rating, review_count, categories ( name, slug )`,
    )
    .eq("role", "operator")
    .eq("status", "Attivo")

  if (options?.category) {
    query = query.filter("categories.slug", "eq", options.category)
  }
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  query = query
    .order("is_online", { ascending: false })
    .order("average_rating", { ascending: false, nullsFirst: false })

  const { data, error } = await query
  if (error) throw new Error(`Error fetching operators: ${error.message}`)
  if (!data) return []

  return data.map((profile: any) => ({
    ...profile,
    specializations: profile.categories ? profile.categories.map((cat: any) => cat.name) : [],
  })) as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select(
      `id, full_name, stage_name, bio, is_available, is_online, profile_image_url, service_prices, average_rating, review_count, status, categories ( name, slug )`,
    )
    .eq("stage_name", stageName)
    .eq("role", "operator")
    .single()

  if (error) {
    console.error("Error fetching operator by stage name:", error)
    return null
  }
  if (!data) return null

  return {
    ...data,
    specializations: (data as any).categories ? (data as any).categories.map((cat: any) => cat.name) : [],
  } as Profile
}

export async function getOperatorForEdit(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("admin_operators_view").select("*").eq("id", operatorId).single()
  if (error) throw new Error("Operatore non trovato o errore nel caricamento.")
  return data
}

export async function updateOperatorProfile(operatorId: string, profileData: any) {
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update(profileData).eq("id", operatorId)

  if (error) {
    return { success: false, message: `Errore durante l'aggiornamento del profilo: ${error.message}` }
  }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  revalidatePath("/")
  return { success: true, message: "Profilo operatore aggiornato con successo." }
}

export async function updateOperatorCommission(operatorId: string, commission: number) {
  if (commission < 0 || commission > 100) {
    return { success: false, message: "La commissione deve essere tra 0 e 100." }
  }
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin.from("profiles").update({ commission_rate: commission }).eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante l'aggiornamento della commissione." }

  revalidatePath("/admin/operators")
  revalidatePath(`/admin/operators/${operatorId}/edit`)
  return { success: true, message: "Commissione aggiornata con successo." }
}

export async function suspendOperator(operatorId: string) {
  const supabaseAdmin = createSupabaseAdminClient()
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: "suspended", is_available: false, is_online: false })
    .eq("id", operatorId)

  if (error) return { success: false, message: "Errore durante la sospensione." }

  revalidatePath("/admin/operators")
  revalidatePath("/")
  return { success: true, message: "Operatore sospeso." }
}
