import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // **LOGICA DI REINDIRIZZAMENTO POST-CONFERMA**
      // Dopo lo scambio del codice, recuperiamo l'utente e il suo profilo
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

        let destination = "/dashboard/client" // Default per i clienti
        if (profile?.role === "admin") {
          destination = "/admin"
        } else if (profile?.role === "operator") {
          destination = "/dashboard/operator"
        }
        return NextResponse.redirect(new URL(destination, request.url))
      }
    }
  }

  // In caso di errore, reindirizza alla pagina di login con un messaggio
  console.error("Authentication callback error:", "Code not found or error exchanging code.")
  const errorUrl = new URL("/login", request.url)
  errorUrl.searchParams.set("error", "Impossibile completare l'autenticazione. Riprova.")
  return NextResponse.redirect(errorUrl)
}
