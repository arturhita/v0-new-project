import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// Rinominato per chiarezza e coerenza. Questa è l'unica fonte di verità.
export const createSupabaseServerClient = () => {
  const cookieStore = cookies()

  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          // Il metodo `set` è stato chiamato da un Server Component.
          // Può essere ignorato se si dispone di un middleware che aggiorna le sessioni utente.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options })
        } catch (error) {
          // Il metodo `delete` è stato chiamato da un Server Component.
          // Può essere ignorato se si dispone di un middleware che aggiorna le sessioni utente.
        }
      },
    },
  })
}
