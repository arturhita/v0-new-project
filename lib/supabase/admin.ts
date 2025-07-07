import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// Variabile cache per evitare di ricreare il client a ogni chiamata
let supabaseAdminClient: SupabaseClient | undefined

/**
 * Crea e restituisce un client Supabase con privilegi di amministratore (service_role).
 * Utilizza una cache per restituire la stessa istanza se già creata.
 * DA USARE SOLO IN AMBIENTI SERVER SICURI (Server Actions, Route Handlers).
 */
export function createSupabaseAdminClient(): SupabaseClient {
  if (supabaseAdminClient) {
    return supabaseAdminClient
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase URL or Service Role Key is missing from environment variables.")
  }

  supabaseAdminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return supabaseAdminClient
}
