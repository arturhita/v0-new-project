import { createClient, type SupabaseClient } from "@supabase/supabase-js"

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Le variabili d'ambiente SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY non sono state impostate.")
}

// Crea ed esporta un'istanza singola e riutilizzabile del client admin.
// Questo previene la creazione di nuove connessioni ad ogni chiamata.
export const supabaseAdmin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
)
