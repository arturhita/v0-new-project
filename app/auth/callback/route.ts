import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const supabase = createClient()

  if (code) {
    // Se c'è un codice, è un login via link magico o conferma email
    await supabase.auth.exchangeCodeForSession(code)
  }

  // A questo punto, l'utente dovrebbe avere una sessione valida
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // Se non c'è utente, qualcosa è andato storto. Torna al login.
    return NextResponse.redirect(new URL("/login?error=Authentication failed", request.url))
  }

  // Recupera il profilo per determinare il ruolo
  const { data: rawProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !rawProfile) {
    // Sicurezza: esegui il logout se il profilo non esiste e reindirizza con errore
    await supabase.auth.signOut()
    return NextResponse.redirect(new URL("/login?error=Profile not found", request.url))
  }

  // Usa structuredClone per sicurezza
  const profile = structuredClone(rawProfile)

  // Reindirizza alla dashboard corretta
  let destination = "/"
  if (profile.role === "admin") destination = "/admin"
  else if (profile.role === "operator") destination = "/dashboard/operator"
  else if (profile.role === "client") destination = "/dashboard/client"

  return NextResponse.redirect(new URL(destination, request.url))
}
