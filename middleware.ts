import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/"
}

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
          request.cookies.set({ ...options, name, value })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ ...options, name, value })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ ...options, name, value: "" })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ ...options, name, value: "" })
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage = pathname === "/login" || pathname === "/register"
  const isProtectedRoute = pathname.startsWith("/admin") || pathname.startsWith("/dashboard")

  if (!user && isProtectedRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
    const userRole = profile?.role
    const userDashboardUrl = getDashboardUrl(userRole)

    if (isAuthPage) {
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }

    if (pathname.startsWith("/admin") && userRole !== "admin") {
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
    if (pathname.startsWith("/dashboard/operator") && userRole !== "operator") {
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
    if (pathname.startsWith("/dashboard/client") && userRole !== "client") {
      return NextResponse.redirect(new URL(userDashboardUrl, request.url))
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|api).*)"],
}
