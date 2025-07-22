"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"

interface DiagnosticsResult {
  auth_user_found: boolean
  profile_found: boolean
  profile_data: any | null
}

export async function runUserDiagnostics(userId: string): Promise<DiagnosticsResult> {
  if (!userId) {
    console.error("DIAGNOSTICS: Ricevuto un userId nullo o vuoto.")
    return { auth_user_found: false, profile_found: false, profile_data: null }
  }

  try {
    // Check 1: Look for the user in auth.users using the admin client
    const { data: authUserData, error: authError } = await supabaseAdmin.auth.admin.getUserById(userId)

    if (authError || !authUserData?.user) {
      console.error(`DIAGNOSTICS: Utente Auth con ID ${userId} non trovato.`, authError)
      return { auth_user_found: false, profile_found: false, profile_data: null }
    }

    const authUser = authUserData.user
    console.log(`DIAGNOSTICS: Utente Auth trovato: ${authUser.email} (ID: ${authUser.id})`)

    // Check 2: Look for the profile in public.profiles using the admin client
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single()

    if (profileError || !profileData) {
      console.error(`DIAGNOSTICS: Profilo per l'utente ID ${userId} non trovato in public.profiles.`, profileError)
      return { auth_user_found: true, profile_found: false, profile_data: null }
    }

    console.log(`DIAGNOSTICS: Successo! Trovato utente auth e profilo per l'ID ${userId}. Dati profilo:`, profileData)
    return { auth_user_found: true, profile_found: true, profile_data: profileData }
  } catch (e) {
    console.error("DIAGNOSTICS: Errore inaspettato durante l'esecuzione della diagnostica.", e)
    return { auth_user_found: false, profile_found: false, profile_data: null }
  }
}
