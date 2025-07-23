import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const supabase = createClient()

  if (code) {
    // This is for email confirmation link
    await supabase.auth.exchangeCodeForSession(code)
  }

  // After login or email confirmation, get the user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // If no user, redirect back to login
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Authentication failed`)
  }

  // Get user's role from the profiles table
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    // If profile doesn't exist, something is wrong. Sign out and redirect to login.
    await supabase.auth.signOut()
    return NextResponse.redirect(`${requestUrl.origin}/login?error=Profile not found`)
  }

  // Redirect based on role
  let destination = "/"
  switch (profile.role) {
    case "admin":
      destination = "/admin"
      break
    case "operator":
      destination = "/dashboard/operator"
      break
    case "client":
      destination = "/dashboard/client"
      break
    default:
      // Fallback to login with an error if role is unknown
      await supabase.auth.signOut()
      destination = "/login?error=Unknown role"
      break
  }

  return NextResponse.redirect(`${requestUrl.origin}${destination}`)
}
