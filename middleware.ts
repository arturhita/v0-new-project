import { createClient } from "@/lib/supabase/middleware"
import { NextResponse, type NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request)

  // Refresh session if expired - this will refresh the cookie
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/admin", "/profile"]
  const isProtectedRoute = protectedRoutes.some((path) => pathname.startsWith(path))

  // Define auth routes (users should NOT see these if logged in)
  const authRoutes = ["/login", "/register", "/registrazione-operatore"]
  const isAuthRoute = authRoutes.some((path) => pathname.startsWith(path))

  // 1. If user is not logged in and is trying to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // 2. If user IS logged in and is trying to access an auth route, redirect to their dashboard
  if (user && isAuthRoute) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    let dashboardUrl = "/dashboard/client" // Default dashboard
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
