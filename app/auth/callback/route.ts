import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { getSanitizedProfile } from "@/lib/actions/user.actions"

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

  // Usa la nuova funzione sicura per ottenere il profilo
  const profile = await getSanitizedProfile(user.id)

  let destination = "/dashboard/client" // Default
  if (profile?.role === "admin") {
    destination = "/admin"
  } else if (profile?.role === "operator") {
    destination = "/dashboard/operator"
  }

  return NextResponse.redirect(new URL(destination, request.url))
}
