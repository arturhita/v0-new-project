import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    })
  }

  // Utilizza le variabili d'ambiente per creare un client Supabase con i privilegi di service_role
  // Questo è necessario perché il cron job non ha una sessione utente
  const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  try {
    const { data, error } = await supabaseAdmin.rpc("process_minute_billing")

    if (error) {
      console.error("Errore durante l'esecuzione del cron job di fatturazione:", error)
      return NextResponse.json(
        { success: false, message: "Errore del server durante la fatturazione.", error: error.message },
        { status: 500 },
      )
    }

    console.log("Cron job di fatturazione eseguito con successo:", data)
    return NextResponse.json({ success: true, data })
  } catch (e: any) {
    console.error("Errore imprevisto nel cron job:", e)
    return NextResponse.json({ success: false, message: "Errore imprevisto.", error: e.message }, { status: 500 })
  }
}
