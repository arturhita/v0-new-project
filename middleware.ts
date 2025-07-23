import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Definisci le rotte protette che richiedono l'autenticazione
const protectedRoutes = ["/admin", "/dashboard"]
// Definisci le rotte di autenticazione che non dovrebbero essere accessibili se si è già loggati
const authRoutes = ["/login", "/register", "/reset-password", "/update-password"]

export async function middleware(request: NextRequest) {
  // Crea una risposta che verrà passata e modificata
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
          // Aggiorna i cookie sia nella richiesta che nella risposta
          request.cookies.set({ name, value, ...options })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          // Rimuovi i cookie sia dalla richiesta che dalla risposta
          request.cookies.set({ name, value: "", ...options })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // È fondamentale rinfrescare la sessione per assicurarsi che sia aggiornata
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Controlla se l'utente sta tentando di accedere a una rotta protetta
  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  if (!user && isAccessingProtectedRoute) {
    // Se l'utente non è loggato e cerca di accedere a una rotta protetta,
    // reindirizzalo alla pagina di login con un messaggio.
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  // Controlla se un utente loggato sta tentando di accedere a una rotta di autenticazione
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (user && isAccessingAuthRoute) {
    // Se l'utente è loggato e visita /login, /register, etc.,
    // reindirizzalo alla sua dashboard appropriata.
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let redirectUrl = "/"
    switch (profile?.role) {
      case "admin":
        redirectUrl = "/admin"
        break
      case "operator":
        redirectUrl = "/dashboard/operator"
        break
      case "client":
        redirectUrl = "/dashboard/client"
        break
    }
    return NextResponse.redirect(new URL(redirectUrl, request.url))
  }

  // Se nessuna delle condizioni di reindirizzamento è soddisfatta,
  // procedi con la richiesta originale.
  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione delle immagini)
     * - favicon.ico (file favicon)
     * - api (le rotte API gestiscono l'autenticazione internamente se necessario)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
