import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { sanitizeData } from "@/lib/data.utils";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const supabase = createClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Se non c'è utente, torna al login con un errore.
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  // Recupera il profilo completo
  const { data: rawProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  // **PUNTO CHIAVE**: Sanifica il profilo subito dopo averlo recuperato.
  const profile = sanitizeData(rawProfile);

  // Determina la destinazione in base al ruolo del profilo sanificato.
  let destination = "/dashboard/client"; // Default
  if (profile?.role === "admin") {
    destination = "/admin";
  } else if (profile?.role === "operator") {
    destination = "/dashboard/operator";
  }

  return NextResponse.redirect(new URL(destination, request.url));
}
