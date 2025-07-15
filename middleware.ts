import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // This will refresh the session cookie if needed
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Auth routes (for logged-out users)
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

  // Protected routes definitions
  const isAdminRoute = pathname.startsWith("/admin")
  const isOperatorRoute = pathname.startsWith("/dashboard/operator") || pathname.startsWith("/profile/operator")
  const isClientRoute = pathname.startsWith("/dashboard/client") || pathname === "/profile"

  // If user is not logged in, redirect any protected route to login
  if (!user && (isAdminRoute || isOperatorRoute || isClientRoute)) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("message", "Devi effettuare l'accesso per visualizzare questa pagina.")
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in, check role-based access
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const userRole = profile?.role

    const unauthorizedRedirect = () => {
      const url = new URL("/login", request.url)
      url.searchParams.set("message", "Accesso non autorizzato.")
      // We might want to sign the user out if they are in an invalid state
      // For now, just redirecting.
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && userRole !== "admin") {
      return unauthorizedRedirect()
    }
    if (isOperatorRoute && userRole !== "operator") {
      return unauthorizedRedirect()
    }
    if (isClientRoute && userRole !== "client") {
      // Admins and Operators should not access client dashboard directly
      return unauthorizedRedirect()
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
