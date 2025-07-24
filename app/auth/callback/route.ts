import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sanitizeData } from "@/lib/data.utils"
import type { Profile } from "@/types/profile.types"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const supabase = createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: rawProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  // Sanifica anche se usiamo solo il ruolo, per coerenza e sicurezza.
  const profile = sanitizeData(rawProfile as Pick<Profile, "role"> | null)

  let destination = "/dashboard/client" // Default
  if (profile?.role === "admin") {
    destination = "/admin"
  } else if (profile?.role === "operator") {
    destination = "/dashboard/operator"
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
