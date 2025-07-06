import { createBrowserClient } from "@supabase/ssr"

// Questa funzione viene eseguita una sola volta, creando un'istanza singleton.
function createClient() {
  return createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Esportiamo l'istanza, non la funzione di creazione.
// In questo modo, ogni parte dell'app che importa `supabase` userà lo stesso oggetto.
const supabase = createClient()

export default supabase
