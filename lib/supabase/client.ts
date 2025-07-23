import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

// Declare the client variable in the module scope
let client: SupabaseClient | undefined

export function getSupabaseBrowserClient() {
  // Create the client if it doesn't exist yet
  if (client === undefined) {
    client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
  }

  return client
}
