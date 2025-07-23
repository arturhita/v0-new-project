import { NextResponse, type NextRequest } from "next/server"
import { createServerClient, type CookieOptions } from "@supabase/ssr"

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
          // If the cookie is set, update the request's cookies.
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Also update the response's cookies.
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // If the cookie is removed, update the request's cookies.
          request.cookies.set({
            name,
            value: "",
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Also update the response's cookies.
          response.cookies.set({
            name,
            value: "",
            ...options,
          })
        },
      },
    },
  )

  // Refresh session if expired - this will set a new cookie on the response
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const protectedRoutes = ["/admin", "/dashboard"]
  const authRoutes = ["/login", "/register", "/reset-password", "/update-password"]

  const isAccessingProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))
  const isAccessingAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Redirect to login if user is not authenticated and trying to access a protected route
  if (!user && isAccessingProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere a questa pagina.")
    return NextResponse.redirect(url)
  }

  // Redirect to the appropriate dashboard if user is authenticated and trying to access an auth route
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
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes)
     */
    "/((?!_next/static|_next/image|favicon.ico|api).*)",
  ],
}
