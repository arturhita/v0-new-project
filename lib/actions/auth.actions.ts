import type { z } from "zod"
import type { loginSchema } from "@/lib/validations/auth"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: error.message }
  }

  if (!data.user) {
    return { error: "Login fallito, utente non trovato." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profileError || !profile) {
    // User is logged in, but has no profile/role. Redirect to home.
    redirect("/")
  }

  // Redirect based on role
  switch (profile.role) {
    case "admin":
      redirect("/admin")
    case "operator":
      redirect("/dashboard/operator")
    case "client":
      redirect("/dashboard/client")
    default:
      redirect("/")
  }
}
