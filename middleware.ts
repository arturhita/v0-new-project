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
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: "", ...options })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isAdminRoute = pathname.startsWith("/admin")
  const isOperatorRoute = pathname.startsWith("/dashboard/operator")
  const isClientRoute = pathname.startsWith("/dashboard/client")
  const isProtectedRoute = isAdminRoute || isOperatorRoute || isClientRoute

  // If user is not logged in, redirect to login from any protected route
  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is logged in, handle redirects
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const role = profile?.role

    // If user is on an auth page, redirect to their correct dashboard
    if (isAuthPage) {
      let destination = "/"
      if (role === "admin") destination = "/admin/dashboard"
      else if (role === "operator") destination = "/dashboard/operator"
      else if (role === "client") destination = "/dashboard/client"
      return NextResponse.redirect(new URL(destination, request.url))
    }

    // If user is on a protected route but with the wrong role, redirect to their correct dashboard
    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    if (isOperatorRoute && role !== "operator") {
      return NextResponse.redirect(new URL("/", request.url))
    }
    // Add more specific role checks if needed
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
     * - images/ (your images)
     */
    "/((?!_next/static|_next/image|favicon.ico|images).*)",
  ],
}
