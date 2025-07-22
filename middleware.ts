import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to homepage if role is unknown
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => request.cookies.get(name)?.value,
        set: (name, value, options) => {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove: (name, options) => {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  // This refreshes the session cookie if it's expired.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard")

  // If user is not logged in and trying to access a protected route, redirect to login
  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url)
    redirectUrl.searchParams.set("redirectedFrom", pathname)
    console.log(`[Middleware] No user, protected route. Redirecting to login.`)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is logged in
  if (user) {
    // Fetch profile role. This is a critical step.
    const { data: profile, error } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    // If there's an error fetching the profile, don't redirect.
    // Let the client-side handle showing an error.
    if (error || !profile) {
      console.error(
        `[Middleware] User ${user.id} is logged in but profile could not be fetched. Error: ${
          error?.message
        }. Allowing request to proceed for client-side handling.`,
      )
      return response
    }

    const userRole = profile.role
    const userDashboardUrl = getDashboardUrl(userRole)

    // If user is on an auth page, redirect to their dashboard
    if (isAuthPage) {
      console.log(`[Middleware] User with role '${userRole}' on auth page. Redirecting to ${userDashboardUrl}.`)
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }

    // Role-based protection for protected routes
    if (pathname.startsWith("/admin") && userRole !== "admin") {
      console.log(
        `[Middleware] Role mismatch: User '${userRole}' trying to access /admin. Redirecting to ${userDashboardUrl}.`,
      )
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
    if (pathname.startsWith("/dashboard/operator") && userRole !== "operator") {
      console.log(
        `[Middleware] Role mismatch: User '${userRole}' trying to access /dashboard/operator. Redirecting to ${userDashboardUrl}.`,
      )
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
    if (pathname.startsWith("/dashboard/client") && userRole !== "client") {
      console.log(
        `[Middleware] Role mismatch: User '${userRole}' trying to access /dashboard/client. Redirecting to ${userDashboardUrl}.`,
      )
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
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
     * - sounds/ (audio files)
     */
    "/((?!_next/static|_next/image|favicon.ico|images|api|sounds).*)",
  ],
}
