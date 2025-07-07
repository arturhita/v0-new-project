import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// La funzione ora accetta l'URL e la chiave come argomenti
export function createClient(supabaseUrl: string, supabaseAnonKey: string) {
  // Aggiungiamo un controllo di sicurezza
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and Anon Key are required to create a client.")
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
