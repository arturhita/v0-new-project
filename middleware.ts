import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Crea un oggetto di risposta per poter modificare le sue intestazioni.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Crea un client Supabase che può leggere e scrivere i cookie.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Se il cookie viene impostato, aggiorna i cookie della richiesta e della risposta.
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Se il cookie viene rimosso, aggiorna i cookie della richiesta e della risposta.
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Questa riga è fondamentale per aggiornare il cookie di sessione.
  // Renderà anche l'oggetto utente disponibile nei componenti server.
  await supabase.auth.getUser()

  // Restituisce l'oggetto di risposta, che potrebbe avere una nuova intestazione `Set-Cookie`.
  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione delle immagini)
     * - favicon.ico (file favicon)
     * - api/ (rotte API)
     * - sounds/ (file audio)
     * - images/ (file immagine)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|sounds|images).*)",
  ],
}
