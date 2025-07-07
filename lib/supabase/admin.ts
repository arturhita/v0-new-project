import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/database"

// Questo client usa la SERVICE_ROLE_KEY per bypassare le policy RLS.
// DA USARE SOLO NELLE SERVER ACTIONS E ROUTE HANDLERS, MAI SUL CLIENT.
export function createAdminClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
