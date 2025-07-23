import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/admin"

// Assicura che la route non venga messa in cache
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    })
  }

  const supabase = createClient()
  const { data, error } = await supabase.rpc("process_all_active_consultations")

  if (error) {
    console.error("Errore Cron Job: Impossibile processare i consulti", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  console.log("Esecuzione Cron Job: Processati i consulti attivi.", data)
  return NextResponse.json({ success: true, results: data })
}
