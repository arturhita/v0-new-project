"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export type UserProfileRescueInfo = {
  id: string
  email: string | undefined
  created_at: string
  profile_exists: boolean
  full_name: string | null
  stage_name: string | null
  role: string | null
  status: string | null
}

export async function getDataForRescuePage(): Promise<UserProfileRescueInfo[]> {
  const supabaseAdmin = createAdminClient()

  const {
    data: { users },
    error: authError,
  } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 1000 })

  if (authError) {
    console.error("Error fetching auth users:", authError)
    throw new Error("Impossibile recuperare gli utenti da Auth.")
  }

  const { data: profiles, error: profilesError } = await supabaseAdmin.from("profiles").select("*")

  if (profilesError) {
    console.error("Error fetching profiles:", profilesError)
    throw new Error("Impossibile recuperare i profili.")
  }

  const profilesMap = new Map(profiles.map((p) => [p.id, p]))

  const combinedData = users.map((user) => {
    const profile = profilesMap.get(user.id)
    return {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      profile_exists: !!profile,
      full_name: profile?.full_name || user.user_metadata.full_name || null,
      stage_name: profile?.stage_name || user.user_metadata.stage_name || null,
      role: profile?.role || null,
      status: profile?.status || null,
    }
  })

  return combinedData
}

export async function forceUserRoleAndStatus(
  userId: string,
  role: "operator" | "client",
  status: "Attivo" | "In Attesa" | "Sospeso",
): Promise<{ success: boolean; message: string }> {
  const supabaseAdmin = createAdminClient()

  // 1. Recupera l'utente completo da Auth per accedere ai metadati
  const {
    data: { user },
    error: authError,
  } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (authError || !user) {
    console.error("Error fetching user from Auth:", authError)
    return { success: false, message: "Impossibile trovare l'utente nel sistema di autenticazione." }
  }

  // 2. Recupera il profilo attuale dal database, se esiste
  const { data: existingProfile, error: profileFetchError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single()

  // Ignora l'errore solo se è "nessuna riga trovata", altrimenti segnala un problema reale.
  if (profileFetchError && profileFetchError.code !== "PGRST116") {
    console.error("Error fetching existing profile:", profileFetchError)
    return { success: false, message: "Errore nel recupero del profilo esistente." }
  }

  // 3. Prepara i dati finali, unendo le informazioni in modo sicuro
  // Dà priorità ai dati già presenti nel profilo, poi ai metadati, e infine a un valore di default.
  const metadata = user.user_metadata || {}
  const profileData = {
    id: userId, // Chiave primaria per l'operazione
    role, // Nuovo ruolo
    status, // Nuovo stato

    // Unione sicura dei dati: non si perde nulla
    full_name: existingProfile?.full_name || metadata.full_name || "Nome da definire",
    stage_name: existingProfile?.stage_name || metadata.stage_name || "Nome d'arte da definire",
    avatar_url: existingProfile?.avatar_url || metadata.avatar_url || null,
    bio: existingProfile?.bio || metadata.bio || null,
    specialties: existingProfile?.specialties || metadata.specialties || [],
    categories: existingProfile?.categories || metadata.categories || [],
    services: existingProfile?.services || metadata.services || {},
    availability: existingProfile?.availability || metadata.availability || {},
    phone: existingProfile?.phone || metadata.phone || null,
    commission_rate: existingProfile?.commission_rate, // Mantiene la commissione esistente
  }

  // 4. Usa "upsert" per aggiornare il profilo se esiste, o crearlo se non esiste, in un'unica operazione sicura.
  const { error: upsertError } = await supabaseAdmin.from("profiles").upsert(profileData, { onConflict: "id" })

  if (upsertError) {
    console.error("Error upserting profile:", upsertError)
    return { success: false, message: `Errore database durante l'aggiornamento: ${upsertError.message}` }
  }

  // 5. Aggiorna le pagine rilevanti per mostrare subito le modifiche
  revalidatePath("/admin/data-rescue")
  revalidatePath("/admin/operators")
  revalidatePath("/")
  revalidatePath("/esperti", "layout")
  if (profileData.stage_name) {
    revalidatePath(`/operator/${profileData.stage_name}`)
  }

  return { success: true, message: `Utente ${profileData.stage_name || userId} aggiornato con successo.` }
}

export async function approveOperator(operatorId: string) {
  console.log(`Approvazione operatore: ${operatorId}`)
  return await forceUserRoleAndStatus(operatorId, "operator", "Attivo")
}

export async function rejectOperator(operatorId: string, reason?: string) {
  console.log(`Rifiuto operatore: ${operatorId}, Motivo: ${reason}`)
  return await forceUserRoleAndStatus(operatorId, "operator", "Sospeso")
}
