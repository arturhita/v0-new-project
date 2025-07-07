import { createBrowserClient } from "@supabase/ssr"

// Questa funzione legge le variabili d'ambiente che hai impostato su Vercel
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}
