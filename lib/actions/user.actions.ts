"use server"

import { createClient } from "@/lib/supabase/server"
import { sanitizeData } from "@/lib/data.utils"
import type { Profile } from "@/types/profile.types"

/**
 * Recupera il profilo completo e sanificato per un dato ID utente.
 * Questa è l'UNICA funzione lato server che dovrebbe essere usata per ottenere un profilo,
 * garantendo che i dati siano sempre sicuri da passare ai componenti client.
 * @param userId L'ID dell'utente da recuperare.
 * @returns Un oggetto profilo sanificato o null se non trovato.
 */
export async function getSanitizedProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient()
  const { data: rawProfile, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error || !rawProfile) {
    console.error(`Errore nel recupero del profilo per l'utente ${userId}:`, error?.message)
    return null
  }

  // Il passaggio più importante: sanificare i dati prima di restituirli.
  return sanitizeData(rawProfile as Profile)
}
