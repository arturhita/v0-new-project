import { createClient, type SupabaseClient } from "@supabase/supabase-js"

// IMPORTANTE: Questo client deve essere usato SOLO sul server (in Server Actions o Route Handlers).
// Utilizza la chiave service_role, che ha privilegi di amministratore e non deve MAI essere esposta al client.

// Controlla che le variabili d'ambiente necessarie siano presenti.
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("URL Supabase o Service Role Key mancanti nelle variabili d'ambiente.")
}

// Crea e esporta una singola istanza riutilizzabile del client admin.
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
