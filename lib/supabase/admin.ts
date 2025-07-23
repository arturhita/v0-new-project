import { createClient, type SupabaseClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/**
 * Crea un client Supabase con privilegi di amministratore.
 * Da usare ESCLUSIVAMENTE lato server.
 * @returns {SupabaseClient}
 */
export const createAdminClient = (): SupabaseClient => {
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

/**
 * Istanza singleton del client Supabase con privilegi di amministratore.
 * Da usare ESCLUSIVAMENTE lato server.
 */
export const supabaseAdmin = createAdminClient()
