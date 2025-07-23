import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

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

  // Rinfresca la sessione se è scaduta.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protectedRoutes = ["/admin", "/dashboard"]
  const authRoutes = ["/login", "/register", "/reset-password", "/update-password"]

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Se l'utente non è loggato e cerca di accedere a una pagina protetta, reindirizza a /login
  if (!user && isAccessingProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  // Se l'utente è loggato e cerca di accedere a una pagina di autenticazione, reindirizza alla sua dashboard
  if (user && isAccessingAuthRoute) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let redirectPath = "/"
    if (profile?.role) {
      switch (profile.role) {
        case "admin":
          redirectPath = "/admin"
          break
        case "operator":
          redirectPath = "/dashboard/operator"
          break
        case "client":
          redirectPath = "/dashboard/client"
          break
      }
    }
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
