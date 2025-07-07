"use client"

import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/types/database"

// Questa funzione verrà chiamata da un Componente Client, ma le variabili d'ambiente
// verranno passate da un Componente Server.
export function createClient(supabaseUrl: string, supabaseAnonKey: string) {
  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
