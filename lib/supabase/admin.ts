import { createClient } from "@supabase/supabase-js"

// Client con privilegi di amministratore per operazioni di backend sicure.
// Bypassa le policy RLS. Usare con la massima cautela.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  },
)
