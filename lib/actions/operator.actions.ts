"use server"

import { z } from "zod"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"
import { revalidatePath } from "next/cache"

// Schema di validazione per i dati in input dal form
const OperatorInputSchema = z.object({
  email: z.string().email({ message: "Email non valida." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
  fullName: z.string().min(3, { message: "Il nome completo è obbligatorio." }),
  stageName: z.string().min(3, { message: "Il nome d'arte è obbligatorio." }),
  phone: z.string().optional(),
  bio: z.string().optional(),
  commission: z.coerce.number(),
  status: z.enum(["Attivo", "In Attesa", "Sospeso"]),
  isOnline: z.boolean(),
  categories: z.string().array().min(1, { message: "Selezionare almeno una categoria." }),
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
  avatarUrl: z.string().optional(), // L'avatar non viene ancora salvato, ma lo schema lo prevede
})

/**
 * VERSIONE CORRETTA E STABILE
 * Converte i nomi delle categorie in UUID prima dell'inserimento.
 * Gestisce il rollback e la revalidation dei percorsi.
 */
export async function createOperator(operatorData: unknown) {
  console.log("--- Inizio azione di creazione operatore (versione stabile) ---")
  let newUserId: string | null = null
  const supabaseAdmin = createSupabaseAdminClient()

  try {
    // 1. Validazione con Zod
    const validation = OperatorInputSchema.safeParse(operatorData)
    if (!validation.success) {
      // Estrae il primo errore per un messaggio più chiaro
      const firstError = Object.values(validation.error.flatten().fieldErrors)[0]?.[0]
      throw new Error(`Dati non validi: ${firstError}` || "Errore di validazione.")
    }
    const { avatarUrl, ...data } = validation.data
    console.log(`[1/6] Dati validati per ${data.email}.`)

    // 2. Controllo Esistenza Email o Nome d'Arte
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from("profiles")
      .select("id")
      .or(`email.eq.${data.email},stage_name.eq.${data.stageName}`)
      .maybeSingle()

    if (checkError) throw new Error(`Errore DB controllo esistenza: ${checkError.message}`)
    if (existingProfile) throw new Error("Un operatore con questa email o nome d'arte esiste già.")
    console.log("[2/6] Email e nome d'arte sono unici.")

    // 3. Conversione Nomi Categorie in UUID
    const { data: categoryData, error: categoryError } = await supabaseAdmin
      .from("categories")
      .select("id")
      .in("name", data.categories)

    if (categoryError) throw new Error(`Errore DB recupero categorie: ${categoryError.message}`)
    if (categoryData.length !== data.categories.length) throw new Error("Una o più categorie non sono valide.")
    const categoryUuids = categoryData.map((c) => c.id)
    console.log("[3/6] Nomi categorie convertiti in UUIDs.")

    // 4. Creazione Utente in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { role: "operator", full_name: data.fullName, stage_name: data.stageName },
    })
    if (authError) throw new Error(`Errore Auth: ${authError.message}`)
    newUserId = authData.user.id
    console.log(`[4/6] Utente Auth creato con ID: ${newUserId}`)

    // 5. Inserimento Profilo nel Database
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
      is_available: data.isOnline, // Impostiamo available come online inizialmente
      main_discipline: data.categories[0],
      specialties: data.specialties,
      categories: categoryUuids, // <-- QUI L'ERRORE È STATO CORRETTO
      service_prices: data.services,
      availability_schedule: data.availability,
      profile_image_url: null, // Gestione avatar in un secondo momento
    })

    if (profileError) throw new Error(`Errore Database durante inserimento profilo: ${profileError.message}`)
    console.log("[5/6] Profilo inserito nel DB con successo.")

    // 6. Revalidation dei percorsi per aggiornare la UI
    revalidatePath("/admin/operators")
    revalidatePath("/")
    console.log("[6/6] Percorsi revalidati.")

    console.log("--- Azione completata con SUCCESSO ---")
    return {
      success: true,
      message: `Operatore "${data.stageName}" creato con successo.`,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Errore sconosciuto."
    console.error("--- CATTURATO ERRORE CRITICO:", errorMessage)

    if (newUserId) {
      console.log(`[ROLLBACK] Avvio eliminazione utente Auth orfano: ${newUserId}`)
      await supabaseAdmin.auth.admin.deleteUser(newUserId)
      console.log("[ROLLBACK] Utente Auth orfano eliminato.")
    }

    return { success: false, message: `Creazione fallita: ${errorMessage}` }
  }
}

// --- LE ALTRE FUNZIONI RIMANGONO INVARIATE ---

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
