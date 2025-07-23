import { supabaseAdmin } from "@/lib/supabase/admin"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic" // Assicura che la route non venga messa in cache

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cronSecret = searchParams.get("cron_secret")

  if (cronSecret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin.rpc("process_all_active_consultations")

    if (error) {
      console.error("Errore durante il Cron Job di fatturazione:", error)
      return NextResponse.json({ success: false, message: error.message }, { status: 500 })
    }

    console.log("Cron Job di fatturazione eseguito con successo:", data)
    return NextResponse.json({ success: true, results: data })
  } catch (e: any) {
    console.error("Errore imprevisto nel Cron Job di fatturazione:", e)
    return NextResponse.json({ success: false, message: e.message }, { status: 500 })
  }
}
