import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const protectedRoutes = ["/admin", "/dashboard"]
const authRoutes = ["/login", "/register", "/reset-password"]

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
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Caso 1: Utente non loggato tenta di accedere a una rotta protetta
  if (!user && isAccessingProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  // Caso 2: Utente loggato si trova su una rotta di autenticazione (es. /login)
  if (user && isAccessingAuthRoute) {
    // Dobbiamo reindirizzarlo alla sua dashboard.
    // Per farlo, abbiamo bisogno del suo ruolo.
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    let redirectPath = "/" // Fallback
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

  // Se nessun caso corrisponde, continua la navigazione
  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
