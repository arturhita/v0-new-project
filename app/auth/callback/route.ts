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
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: rawProfile, error } = await supabase.from("profiles").select("role").eq("id", session.user.id).single()

  if (error || !rawProfile) {
    return NextResponse.redirect(`${origin}/dashboard/client`)
  }

  const profile = sanitizeData(rawProfile as Pick<Profile, "role">)

  if (profile.role === "operator") {
    return NextResponse.redirect(`${origin}/dashboard/operator`)
  }
  if (profile.role === "admin") {
    return NextResponse.redirect(`${origin}/admin`)
  }
  return NextResponse.redirect(`${origin}/dashboard/client`)
}
