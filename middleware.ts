import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

// Helper function to get the user's dashboard URL based on their role
const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin/dashboard"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to homepage
}

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
          request.cookies.set({ ...options, name, value })
          response.cookies.set({ ...options, name, value })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ ...options, name, value: "" })
          response.cookies.set({ ...options, name, value: "" })
        },
      },
    },
  )

  // Refresh session if expired - important!
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/login" || pathname === "/register"

  // --- User is NOT logged in ---
  if (!user) {
    const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard")
    // If trying to access a protected route, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    // Otherwise, allow access (e.g., to homepage, etc.)
    return response
  }

  // --- User IS logged in ---
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  const userRole = profile?.role
  const userDashboardUrl = getDashboardUrl(userRole)

  // If user is on an auth page (login/register), redirect them to their dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL(userDashboardUrl, request.url))
  }

  // Role-based protection for protected routes
  if (pathname.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL(userDashboardUrl, request.url))
  }
  if (pathname.startsWith("/dashboard/operator") && userRole !== "operator") {
    return NextResponse.redirect(new URL(userDashboardUrl, request.url))
  }
  if (pathname.startsWith("/dashboard/client") && userRole !== "client") {
    return NextResponse.redirect(new URL(userDashboardUrl, request.url))
  }

  // If all checks pass, allow the request to proceed
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (your images)
     * - api/ (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api).*)",
  ],
}
