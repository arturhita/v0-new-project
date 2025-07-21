import { createClient } from "@supabase/supabase-js"

// Questa funzione crea una nuova istanza del client admin.
// Deve essere usata in Server Actions e Route Handlers dove sono richiesti i privilegi di amministratore.
export const createAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("URL Supabase o Service Role Key mancanti nelle variabili d'ambiente.")
  }

  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
