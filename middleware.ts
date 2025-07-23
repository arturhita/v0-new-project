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

  if (!user && isAccessingProtectedRoute) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("message", "Devi essere loggato per accedere.")
    return NextResponse.redirect(url)
  }

  if (user && isAccessingAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard/client", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
