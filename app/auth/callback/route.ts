import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Funzione di utilità per sanificare i dati
function sanitizeData<T>(data: T): T {
  if (!data) return data
  return JSON.parse(JSON.stringify(data))
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()
    await supabase.auth.exchangeCodeForSession(code)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const { data: rawProfile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

      // Sanifichiamo il profilo anche se usiamo solo il ruolo, per coerenza.
      const profile = sanitizeData(rawProfile)

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin", request.url))
      } else if (profile?.role === "operator") {
        return NextResponse.redirect(new URL("/dashboard/operator", request.url))
      }
    }
  }

  // URL a cui reindirizzare se l'utente non ha un ruolo o in caso di errore
  return NextResponse.redirect(new URL("/dashboard/client", request.url))
}
