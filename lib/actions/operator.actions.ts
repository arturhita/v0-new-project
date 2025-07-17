"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import { getMockOperatorProfileByStageName } from "@/lib/mock-data"
import { OperatorRegistrationSchema } from "@/lib/schemas"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

type OperatorData = {
  name: string
  surname: string
  stageName: string
  email: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  avatarUrl: string
  services: {
    chatEnabled: boolean
    chatPrice: string
    callEnabled: boolean
    callPrice: string
    emailEnabled: boolean
    emailPrice: string
  }
  availability: any
  status: "Attivo" | "In Attesa" | "Sospeso"
  isOnline: boolean
  commission: string
}

export async function createOperator(operatorData: OperatorData) {
  const supabaseAdmin = createAdminClient()
  const password = Math.random().toString(36).slice(-12)
  let userId: string | undefined = undefined

  try {
    // 1. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: operatorData.email,
      password: password,
      email_confirm: true, // L'email è già confermata, l'operatore può accedere subito
      user_metadata: {
        full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
        stage_name: operatorData.stageName,
        avatar_url: operatorData.avatarUrl,
      },
    })

    if (authError || !authData.user) {
      console.error("Errore creazione utente Auth:", authError)
      if (authError?.message.includes("User already registered")) {
        return { success: false, message: "Un utente con questa email esiste già." }
      }
      return { success: false, message: `Errore Supabase Auth: ${authError?.message}` }
    }
    userId = authData.user.id
    console.log(`Utente Auth creato con ID: ${userId}`)

    // 2. Aggiornamento del profilo creato dal trigger
    const profileToUpdate = {
      full_name: `${operatorData.name} ${operatorData.surname}`.trim(),
      name: operatorData.name,
      surname: operatorData.surname,
      stage_name: operatorData.stageName,
      phone: operatorData.phone,
      bio: operatorData.bio,
      avatar_url: operatorData.avatarUrl,
      role: "operator" as const,
      status: operatorData.status,
      is_online: operatorData.isOnline,
      commission_rate: safeParseFloat(operatorData.commission),
      specialties: operatorData.specialties,
      categories: operatorData.categories,
      availability: operatorData.availability,
      services: {
        chat: {
          enabled: operatorData.services.chatEnabled,
          price_per_minute: safeParseFloat(operatorData.services.chatPrice),
        },
        call: {
          enabled: operatorData.services.callEnabled,
          price_per_minute: safeParseFloat(operatorData.services.callPrice),
        },
        email: {
          enabled: operatorData.services.emailEnabled,
          price: safeParseFloat(operatorData.services.emailPrice),
        },
      },
    }

    const { error: profileError } = await supabaseAdmin.from("profiles").update(profileToUpdate).eq("id", userId)

    if (profileError) {
      throw new Error(`Errore aggiornamento profilo: ${profileError.message}`)
    }
    console.log(`Profilo per l'utente ${userId} aggiornato con successo.`)

    revalidatePath("/admin/operators")
    return {
      success: true,
      message: `Operatore ${operatorData.stageName} creato con successo!`,
      temporaryPassword: password,
    }
  } catch (error: any) {
    console.error("Errore nel processo di creazione operatore:", error)
    // Se qualcosa va storto dopo la creazione dell'utente, lo eliminiamo per evitare dati orfani
    if (userId) {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      console.log(`Utente Auth ${userId} eliminato a causa di un errore successivo.`)
    }
    return {
      success: false,
      message: error.message || "Si è verificato un errore sconosciuto.",
    }
  }
}

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
  } catch (error) {
    console.error("Errore aggiornamento commissione:", error)
    return {
      success: false,
      message: "Errore nell'aggiornamento della commissione",
    }
  }
}

/**
 * Recupera il profilo pubblico completo di un operatore per la sua pagina vetrina.
 * Utilizza una funzione RPC del database per efficienza.
 * @param username - Lo username pubblico (stage_name) dell'operatore.
 * @returns Un oggetto contenente tutti i dati del profilo, o null se non trovato.
 */
export async function getOperatorPublicProfile(username: string) {
  noStore()
  const supabase = createClient() // Usiamo il client standard per la lettura pubblica

  console.log(`[DB-FETCH] Inizio ricerca profilo REALE per stage_name: "${username}"`)

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .ilike("stage_name", username)
    .eq("role", "operator")
    .eq("status", "Attivo") // Mostra solo operatori attivi
    .single()

  if (profileError || !profile) {
    console.error(
      `[DB-FETCH] Profilo REALE non trovato per "${username}" (o non è 'Attivo'). Errore: ${profileError?.message}`,
    )
    return null
  }

  console.log(`[DB-FETCH] Profilo REALE trovato per "${username}". ID: ${profile.id}`)

  // Combina i dati per la pagina
  const services = profile.services as any
  const combinedData = {
    id: profile.id,
    full_name: profile.full_name,
    stage_name: profile.stage_name,
    avatar_url: profile.avatar_url,
    bio: profile.bio,
    specialization: profile.specialties || [],
    tags: profile.categories || [],
    rating: profile.average_rating,
    reviews_count: profile.reviews_count,
    is_online: profile.is_online,
    availability: profile.availability,
    services: [
      services?.chat?.enabled && {
        service_type: "chat",
        price: services.chat.price_per_minute,
      },
      services?.call?.enabled && {
        service_type: "call",
        price: services.call.price_per_minute,
      },
      services?.email?.enabled && {
        service_type: "written",
        price: services.email.price,
      },
    ].filter(Boolean),
    reviews: [], // TODO: Caricare le recensioni reali
  }

  return combinedData
}

/**
 * Recupera i dati del profilo pubblico di un operatore usando il sistema di dati mock.
 * @param stageName - Il nome d'arte dell'operatore, usato per creare lo slug dell'URL.
 * @returns I dati del profilo o null se non trovato o non attivo.
 */
export async function getMockOperatorPublicProfile(stageName: string) {
  console.log(`[ACTION] Attempting to fetch public profile for stageName: "${stageName}" using MOCK data.`)

  const profileData = getMockOperatorProfileByStageName(stageName)

  if (!profileData) {
    console.log(`[ACTION] MOCK profile not found for stageName: "${stageName}"`)
    return null
  }

  console.log(`[ACTION] Successfully found MOCK profile for: "${profileData.full_name}"`)

  // Simula un piccolo ritardo di rete per un'esperienza più realistica
  await new Promise((resolve) => setTimeout(resolve, 250))

  return profileData
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

export async function updateOperatorProfile(
  userId: string,
  profileData: {
    full_name?: string
    bio?: string
    specialization?: string[]
    tags?: string[]
  },
) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating operator profile:", error)
    return { error: "Impossibile aggiornare il profilo." }
  }

  if (data.stage_name) {
    revalidatePath(`/operator/${data.stage_name}`)
  }
  revalidatePath("/(platform)/dashboard/operator/profile")

  return { data }
}

export async function updateOperatorAvailability(userId: string, availability: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").update({ availability }).eq("id", userId).select().single()

  if (error) {
    console.error("Error updating availability:", error)
    return { error: "Impossibile aggiornare la disponibilità." }
  }

  if (data.stage_name) {
    revalidatePath(`/operator/${data.stage_name}`)
  }
  revalidatePath("/(platform)/dashboard/operator/availability")

  return { data }
}

export async function registerOperator(formData: FormData) {
  const supabase = createClient() // Usa il client standard per la registrazione pubblica

  const rawFormData = Object.fromEntries(formData.entries())

  // Converte le categorie da stringa separata da virgole ad array
  const categories =
    typeof rawFormData.categories === "string" && rawFormData.categories.length > 0
      ? rawFormData.categories.split(",")
      : []

  const validation = OperatorRegistrationSchema.safeParse({
    ...rawFormData,
    categories,
  })

  if (!validation.success) {
    console.log("Validation errors:", validation.error.flatten().fieldErrors)
    return {
      success: false,
      message: "Dati non validi. Controlla i campi.",
      errors: validation.error.flatten().fieldErrors,
    }
  }

  const { email, password, name, surname, stageName, bio } = validation.data

  // 1. Registra l'utente con Supabase Auth
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${name} ${surname}`.trim(),
        stage_name: stageName,
      },
    },
  })

  if (signUpError || !signUpData.user) {
    console.error("Errore durante la registrazione (signUp):", signUpError)
    if (signUpError?.message.includes("User already registered")) {
      return { success: false, message: "Un utente con questa email esiste già." }
    }
    return { success: false, message: signUpError?.message || "Impossibile registrare l'utente." }
  }

  const userId = signUpData.user.id
  console.log(`[Self-Register] Utente Auth creato con ID: ${userId}`)

  // 2. Aggiorna il profilo con i dettagli completi usando il client admin
  const supabaseAdmin = createAdminClient()

  const profileToUpdate = {
    full_name: `${name} ${surname}`.trim(),
    name,
    surname,
    stage_name: stageName,
    bio: bio || "",
    role: "operator" as const,
    status: "Attivo" as const, // Approvazione automatica
    categories: validation.data.categories,
    // Imposta valori predefiniti per gli altri campi
    specialties: [],
    availability: { monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: [] },
    services: {
      chat: { enabled: true, price_per_minute: 2.0 },
      call: { enabled: false, price_per_minute: 2.5 },
      email: { enabled: false, price: 20.0 },
    },
    commission_rate: 20, // Commissione predefinita
    is_online: false,
  }

  const { error: profileError } = await supabaseAdmin.from("profiles").update(profileToUpdate).eq("id", userId)

  if (profileError) {
    console.error(`[Self-Register] Errore aggiornamento profilo per ${userId}:`, profileError)
    // Se l'aggiornamento del profilo fallisce, elimina l'utente appena creato per evitare dati orfani
    await supabaseAdmin.auth.admin.deleteUser(userId)
    return { success: false, message: `Errore durante la finalizzazione del profilo: ${profileError.message}` }
  }

  console.log(`[Self-Register] Profilo per ${userId} aggiornato e attivato con successo.`)

  // Revalida le pagine pertinenti per mostrare subito il nuovo operatore
  revalidatePath("/operator")
  revalidatePath(`/operator/${stageName}`)

  return { success: true, message: "Registrazione completata! Benvenuto/a!" }
}
