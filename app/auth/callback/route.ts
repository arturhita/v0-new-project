import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { sanitizeData } from "@/lib/data.utils"
import type { Profile } from "@/types/profile.types"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const supabase = createClient()

  if (code) {
    // Se c'è un codice, è un login via email link
    await supabase.auth.exchangeCodeForSession(code)
  }

  // A questo punto, l'utente dovrebbe avere una sessione valida,
  // sia da un login con password che da un link di conferma.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // Se non c'è sessione, qualcosa è andato storto.
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const { data: rawProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single()

  if (profileError || !rawProfile) {
    console.error("Profile fetch error on callback:", profileError?.message)
    // Potrebbe essere un nuovo utente il cui profilo non è ancora stato creato dal trigger.
    // In questo caso, lo mandiamo alla dashboard del cliente di default.
    return NextResponse.redirect(`${origin}/dashboard/client`)
  }

  // **PUNTO CHIAVE**: Sanifichiamo il profilo prima di decidere dove reindirizzare.
  const profile = sanitizeData(rawProfile as Pick<Profile, "role">)

  if (profile.role === "operator") {
    return NextResponse.redirect(`${origin}/dashboard/operator`)
  }
  if (profile.role === "admin") {
    return NextResponse.redirect(`${origin}/admin`)
  }
  return NextResponse.redirect(`${origin}/dashboard/client`)
}
