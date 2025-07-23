import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  // URL to redirect to after sign in process completes
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    if (profile?.role === "operator") {
      return NextResponse.redirect(new URL("/dashboard/operator", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard/client", request.url))
  }

  // If no user, redirect to login
  return NextResponse.redirect(new URL("/login", request.url))
}
