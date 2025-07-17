import { createClient } from "@supabase/supabase-js"

// IMPORTANTE: Questo client deve essere usato SOLO sul server (in Server Actions o Route Handlers).
// Utilizza la chiave service_role, che ha privilegi di amministratore e non deve MAI essere esposta al client.
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("URL Supabase o Service Role Key mancanti.")
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
