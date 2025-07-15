import { updateSession } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // This function will create a Supabase client and refresh the session cookie.
  const { supabase, response } = await updateSession(request)

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
      // In a real-world scenario, you might want to log this event.
      return NextResponse.redirect(url)
    }

    if (isAdminRoute && userRole !== "admin") return unauthorizedRedirect()
    if (isOperatorRoute && userRole !== "operator") return unauthorizedRedirect()
    // Note: This logic assumes clients can't access operator/admin dashboards.
    // The redirects for those cases are handled by the unauthorizedRedirect.
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
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
