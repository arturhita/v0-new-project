import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  // Crea una risposta iniziale che possiamo modificare.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // La funzione `get` legge un cookie dalla richiesta in arrivo.
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        // La funzione `set` imposta un cookie sulla risposta in uscita.
        set(name: string, value: string, options: CookieOptions) {
          // Se `set` viene chiamato, dobbiamo assicurarci di usare la risposta
          // che stiamo per restituire, modificandola direttamente.
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        // La funzione `remove` elimina un cookie sulla risposta in uscita.
        remove(name: string, options: CookieOptions) {
          // Anche qui, modifichiamo la risposta in uscita.
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Rinfresca la sessione se è scaduta. Questo è fondamentale per mantenere
  // l'utente loggato. Questo si applica a tutte le rotte.
  await supabase.auth.getUser()

  // Restituisce la risposta (potenzialmente modificata con i nuovi cookie).
  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione delle immagini)
     * - favicon.ico (file favicon)
     * - /images/ (le tue immagini)
     * - /auth/ (pagine di autenticazione)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|auth/).*)",
  ],
}
