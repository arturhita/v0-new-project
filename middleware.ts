import { createServerClient } from "@supabase/ssr"
import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // First, refresh the session cookie
  const response = await updateSession(request)

  // Now, create a new client to read the user from the (potentially updated) request cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define routes for logged-out users
  const authRoutes = ["/login", "/register", "/registrazione-operatore"]
  const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path))

  // If user is logged in and tries to access an auth route, redirect to their dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    let dashboardUrl = "/dashboard/client" // Default
    if (profile) {
      switch (profile.role) {
        case "admin":
          dashboardUrl = "/admin/dashboard"
          break
        case "operator":
          dashboardUrl = "/dashboard/operator"
          break
      }
    }
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // Define protected routes
  const isAdminRoute = pathname.startsWith("/admin")
  const isOperatorRoute = pathname.startsWith("/dashboard/operator") || pathname.startsWith("/profile/operator")
  const isClientRoute = pathname.startsWith("/dashboard/client") || pathname.startsWith("/profile")
  const isProtectedRoute = isAdminRoute || isOperatorRoute || isClientRoute

  // If user is not logged in and tries to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("message", "Devi effettuare l'accesso per visualizzare questa pagina.")
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in, perform role-based authorization for protected routes
  if (user && isProtectedRoute) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const userRole = profile?.role

    const unauthorizedRedirect = () => {
      const url = new URL("/login", request.url)
      url.searchParams.set("message", "Accesso non autorizzato a questa risorsa.")
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && userRole !== "admin") return unauthorizedRedirect()
    if (isOperatorRoute && userRole !== "operator") return unauthorizedRedirect()
  }

  // If no redirects are needed, pass the response along.
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
