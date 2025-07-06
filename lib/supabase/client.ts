import { createBrowserClient } from "@supabase/ssr"

// Creiamo una singola istanza del client per il browser.
// Questo evita l'avviso "Multiple GoTrueClient instances".
const supabaseClient = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
)

export const getSupabaseBrowserClient = () => supabaseClient
