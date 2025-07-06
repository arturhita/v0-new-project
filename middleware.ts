import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // Rinfresca la sessione utente se è scaduta
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl

  // Protezione delle rotte: se l'utente non è loggato e cerca di accedere
  // a /admin o /dashboard, viene reindirizzato alla pagina di login.
  if (!user && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Protezione ruolo Admin: se l'utente è loggato e accede a /admin,
  // controlliamo che abbia il ruolo corretto.
  if (user && url.pathname.startsWith("/admin")) {
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // Se c'è un errore o il ruolo non è 'admin', reindirizza alla home.
    if (error || profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (ottimizzazione immagini)
     * - favicon.ico (file favicon)
     * - /login, /register (pagine di autenticazione)
     * Sentiti libero di modificare questo per adattarlo alle tue esigenze.
     */
    "/((?!_next/static|_next/image|favicon.ico|login|register|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
