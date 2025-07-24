import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function middleware(request: NextRequest) {
  const { supabase, response } = createClient(request);

  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = request.nextUrl;

  // Se l'utente è loggato e cerca di accedere a login o register, reindirizzalo.
  if (session && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/auth/callback", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/login", "/register"],
};
