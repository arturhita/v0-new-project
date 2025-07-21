import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// This is a singleton pattern to avoid creating multiple clients
let adminClient: SupabaseClient

export const createAdminClient = (): SupabaseClient => {
  if (adminClient) {
    return adminClient
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("URL Supabase o Service Role Key mancanti nelle variabili d'ambiente.")
  }

  adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })

  return adminClient
}
