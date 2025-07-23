import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/**
 * Crea un client Supabase con privilegi di amministratore.
 * Da usare ESCLUSIVAMENTE lato server.
 * @returns {SupabaseClient}
 */
export function createAdminClient(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("URL Supabase o Service Role Key mancanti nelle variabili d'ambiente.")
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
