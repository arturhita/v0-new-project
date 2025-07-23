import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createClient()
    const {
      error,
      data: { user },
    } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && user) {
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      if (profile?.role === "admin") {
        return NextResponse.redirect(`${origin}/admin`)
      }
      if (profile?.role === "operator") {
        return NextResponse.redirect(`${origin}/dashboard/operator`)
      }
      if (profile?.role === "client") {
        return NextResponse.redirect(`${origin}/dashboard/client`)
      }
      // Fallback redirect
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
