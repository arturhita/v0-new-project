import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const supabase = createClient()

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the homepage. The AuthProvider will see the new session,
  // fetch the user's role, and redirect them to the correct dashboard.
  // This centralizes the redirection logic.
  return NextResponse.redirect(new URL("/", request.url))
}
