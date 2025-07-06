import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
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
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          // Se il client di autenticazione vuole impostare un cookie,
          // lo impostiamo sulla risposta in modo che venga inviato al browser.
          response.cookies.set(name, value, options)
        },
        remove(name: string, options: CookieOptions) {
          // Se il client di autenticazione vuole rimuovere un cookie,
          // lo rimuoviamo dalla risposta.
          response.cookies.set(name, "", options)
        },
      },
    },
  )

  // Rinfresca la sessione utente se è scaduta.
  // IMPORTANTE: `getSession()` deve essere chiamato per far funzionare l'autenticazione server-side.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const url = request.nextUrl

  // Se l'utente non è loggato e cerca di accedere a una rotta protetta,
  // lo reindirizziamo alla pagina di login.
  if (!session && (url.pathname.startsWith("/admin") || url.pathname.startsWith("/dashboard"))) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se l'utente è loggato e cerca di accedere a /admin, verifichiamo il suo ruolo.
  if (session && url.pathname.startsWith("/admin")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    // Se il ruolo non è 'admin', lo reindirizziamo alla home page.
    if (profile?.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  // Se l'utente è loggato e cerca di accedere a /login o /register,
  // lo reindirizziamo alla sua dashboard.
  if (session && (url.pathname === "/login" || url.pathname === "/register")) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()
    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    } else if (profile?.role === "operator") {
      return NextResponse.redirect(new URL("/dashboard/operator", request.url))
    } else {
      return NextResponse.redirect(new URL("/dashboard/client", request.url))
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
     * - /auth/callback (rotta di callback di Supabase)
     * Sentiti libero di modificare questo per adattarlo alle tue esigenze.
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
