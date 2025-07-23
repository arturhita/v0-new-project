import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Funzione helper per ottenere il percorso della dashboard in base al ruolo
const getDashboardPath = (role: string | undefined) => {
  switch (role) {
    case "admin":
      return "/admin"
    case "operator":
      return "/dashboard/operator"
    case "client":
      return "/dashboard/client"
    default:
      return "/" // Fallback alla homepage se il ruolo non è definito
  }
}

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
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
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

  // Rinfresca sempre la sessione per mantenerla attiva
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protectedRoutes = ["/admin", "/dashboard"]
  const authRoutes = ["/login", "/register", "/reset-password", "/update-password"]

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // CASO 1: Utente NON loggato tenta di accedere a una pagina protetta
  if (!user && isAccessingProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  // CASO 2: Utente LOGGATO si trova su una pagina di autenticazione (es. /login)
  if (user && isAccessingAuthRoute) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const redirectPath = getDashboardPath(profile?.role)
    return NextResponse.redirect(new URL(redirectPath, request.url))
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Abbina tutti i percorsi di richiesta eccetto quelli che iniziano con:
     * - _next/static (file statici)
     * - _next/image (file di ottimizzazione delle immagini)
     * - favicon.ico (file favicon)
     * - api/ (rotte API, inclusi i webhook)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
