import { createBrowserClient } from "@supabase/ssr"

/**
 * Crea un client Supabase per l'uso nel browser.
 * Questa funzione può essere chiamata in qualsiasi componente client o hook.
 */
export function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

/**
 * Esportiamo anche un'istanza singleton per comodità e per mantenere
 * la compatibilità con il codice esistente che usa `import supabase from '...'`.
 */
const supabase = createClient()

export default supabase
