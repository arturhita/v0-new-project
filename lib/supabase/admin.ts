import { createClient } from "@supabase/supabase-js"

// Nota: supabaseAdmin utilizza la SERVICE_ROLE_KEY che devi usare solo in un ambiente server sicuro.
// NON esporre MAI questa chiave lato client.
// Assicurati che le variabili d'ambiente NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY
// siano impostate nel tuo progetto Vercel o nel tuo file .env.local.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Supabase URL or Service Role Key is missing from environment variables.")
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
