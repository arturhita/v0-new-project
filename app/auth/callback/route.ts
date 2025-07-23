import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const supabase = createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL("/login?error=Authentication-failed", request.url))
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  let destination = "/dashboard/client" // Default destination
  if (profile?.role === "admin") {
    destination = "/admin"
  } else if (profile?.role === "operator") {
    destination = "/dashboard/operator"
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
