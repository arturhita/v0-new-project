import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Definisci le rotte protette che richiedono l'autenticazione
const protectedRoutes = ["/admin", "/dashboard"]
// Definisci le rotte di autenticazione che non dovrebbero essere accessibili se si è già loggati
const authRoutes = ["/login", "/register", "/reset-password"]

export async function middleware(request: NextRequest) {
  // Crea un oggetto di risposta che può essere modificato e restituito.
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Crea un client Supabase per il middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Il client auth di Supabase chiama questo metodo per impostare i cookie.
          // Dobbiamo assicurarci che vengano impostati sulla risposta.
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Il client auth di Supabase chiama questo metodo per rimuovere i cookie (logout).
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // È FONDAMENTALE aggiornare la sessione. Questo rinfresca il cookie se è scaduto.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Se l'utente non è loggato e cerca di accedere a una rotta protetta...
  if (!user && isAccessingProtectedRoute) {
    // ...reindirizzalo alla pagina di login.
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  // Se l'utente è loggato e cerca di accedere a una rotta di autenticazione...
  if (user && isAccessingAuthRoute) {
    // ...reindirizzalo a una dashboard di default. L'azione di login gestirà il reindirizzamento specifico per ruolo.
    return NextResponse.redirect(new URL("/dashboard/client", request.url))
  }

  // Se non è necessario alcun reindirizzamento, restituisci la risposta originale
  // che ora contiene il cookie di sessione aggiornato.
  return response
}

export const config = {
  matcher: [
    /*
     * Esegui il middleware su tutti i percorsi eccetto quelli che iniziano con:
     * - api (rotte API)
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione immagini)
     * - favicon.ico (file favicon)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
