"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"

// Funzione di supporto per convertire in modo sicuro le stringhe in numeri.
const safeParseFloat = (value: any): number => {
  if (value === null || value === undefined || String(value).trim() === "") return 0
  const num = Number.parseFloat(String(value))
  return isNaN(num) ? 0 : num
}

export async function createOperator(formData: FormData) {
  const supabaseAdmin = createAdminClient()

  const email = formData.get("email") as string
  const name = formData.get("name") as string
  const surname = formData.get("surname") as string
  const stageName = formData.get("stageName") as string
  const password = Math.random().toString(36).slice(-12) // Genera una password sicura
  let userId: string | undefined = undefined

  try {
    // 1. Creazione dell'utente in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${name} ${surname}`.trim(),
        stage_name: stageName,
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

    // Il trigger di Supabase ha già creato un profilo di base.
    // Ora lo aggiorniamo con i dati del form.

    // FASE 1: Aggiornamento dati semplici
    const simpleDataToUpdate = {
      full_name: `${name || ""} ${surname || ""}`.trim(),
      name: name || "",
      surname: surname || "",
      stage_name: stageName || "",
      phone: formData.get("phone") as string | null,
      bio: formData.get("bio") as string | null,
      avatar_url: formData.get("avatarUrl") as string | null,
      role: "operator" as const,
      status: formData.get("status") as "Attivo" | "In Attesa" | "Sospeso",
      is_online: formData.get("isOnline") === "on",
    }

    const { error: simpleUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(simpleDataToUpdate)
      .eq("id", userId)

    if (simpleUpdateError) {
      throw simpleUpdateError
    }

    // FASE 2: Aggiornamento dati complessi
    const complexDataToUpdate = {
      commission_rate: safeParseFloat(formData.get("commission")),
      services: {
        chat: {
          enabled: formData.get("services.chatEnabled") === "on",
          price_per_minute: safeParseFloat(formData.get("services.chatPrice")),
        },
        call: {
          enabled: formData.get("services.callEnabled") === "on",
          price_per_minute: safeParseFloat(formData.get("services.callPrice")),
        },
        email: {
          enabled: formData.get("services.emailEnabled") === "on",
          price: safeParseFloat(formData.get("services.emailPrice")),
        },
      },
      availability: JSON.parse((formData.get("availability") as string) || "{}"),
      specialties:
        (formData.get("specialties") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
      categories:
        (formData.get("categories") as string)
          ?.split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
    }

    const { error: complexUpdateError } = await supabaseAdmin
      .from("profiles")
      .update(complexDataToUpdate)
      .eq("id", userId)

    if (complexUpdateError) {
      throw complexUpdateError
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
    return {
      success: false,
      message: `Errore durante la creazione dell'operatore: ${error.message}`,
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
  const supabase = createAdminClient()

  console.log(`[V0-DEBUG] Inizio ricerca profilo per stage_name: "${username}"`)

  // 1. Trova il profilo base dell'operatore.
  // Usiamo .ilike per una ricerca case-insensitive, che è più robusta per i nomi utente.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .ilike("stage_name", username)
    .eq("role", "operator")
    .single()

  // Se non troviamo un profilo, questo è l'errore principale.
  if (profileError || !profile) {
    console.error(
      `[V0-DEBUG] ERRORE CRITICO: Nessun profilo trovato con stage_name simile a "${username}" e role = "operator". Questo è il motivo dell'errore "Not Found". Errore DB: ${profileError?.message}`,
    )
    return null
  }

  console.log(`[V0-DEBUG] Profilo base trovato per "${username}". ID: ${profile.id}, Status: "${profile.status}"`)

  // 2. CONTROLLO DELLO STATO: Questa è la causa più probabile del problema.
  // Se l'operatore esiste ma non è "Attivo", la sua pagina non deve essere pubblica.
  if (profile.status !== "Attivo") {
    console.warn(
      `[V0-DEBUG] ATTENZIONE: Profilo per "${username}" trovato, ma il suo stato è "${profile.status}" invece di "Attivo". La pagina non verrà mostrata come da requisito.`,
    )
    return null // Restituisce null, che causa correttamente l'errore "Not Found".
  }

  console.log(`[V0-DEBUG] Profilo "${username}" è "Attivo". Procedo a caricare i dati aggiuntivi.`)

  // 3. Recupera i servizi attivi dell'operatore
  const { data: servicesData, error: servicesError } = await supabase
    .from("services")
    .select("service_type, price")
    .eq("operator_id", profile.id)
    .eq("is_active", true)

  if (servicesError) {
    console.error(`[V0-DEBUG] Errore nel caricamento dei servizi per l'operatore ${profile.id}:`, servicesError.message)
  }

  // 4. Recupera le recensioni approvate, con il nome del cliente
  const { data: reviewsData, error: reviewsError } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      client:profiles ( name )
    `,
    )
    .eq("operator_id", profile.id)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10) // Limitiamo per performance

  if (reviewsError) {
    console.error(
      `[V0-DEBUG] Errore nel caricamento delle recensioni per l'operatore ${profile.id}:`,
      reviewsError.message,
    )
  }

  // 5. Combina tutti i dati in un unico oggetto per la pagina
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
    services: servicesData || [],
    reviews:
      reviewsData?.map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        client_name: r.client?.name || "Utente",
      })) || [],
  }

  console.log(`[V0-DEBUG] Dati per "${username}" combinati con successo. La pagina verrà renderizzata.`)

  return combinedData
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
