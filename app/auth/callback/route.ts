import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/"

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Dopo lo scambio del codice, recuperiamo il profilo per decidere dove reindirizzare
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
        if (profile?.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`)
        }
        if (profile?.role === "operator") {
          return NextResponse.redirect(`${origin}/dashboard/operator`)
        }
      }
      // Default redirect per i clienti o in caso di profilo non trovato
      return NextResponse.redirect(`${origin}/dashboard/client`)
    }
  }

  // return the user to an error page with instructions
  console.error("Authentication error: No code found or error exchanging code.")
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
