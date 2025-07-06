import { createBrowserClient } from "@supabase/ssr"

// Un'unica funzione per creare il client nel browser
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
