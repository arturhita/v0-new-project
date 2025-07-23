import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let supabaseAdmin: SupabaseClient | undefined

// This function creates a singleton instance of the Supabase admin client.
export function createAdminClient(): SupabaseClient {
  if (supabaseAdmin) {
    return supabaseAdmin
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("URL Supabase o Service Role Key mancanti nelle variabili d'ambiente.")
  }

  supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return supabaseAdmin
}
