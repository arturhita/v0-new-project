"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email("Email non valida."),
  password: z.string().min(6, "La password deve essere di almeno 6 caratteri."),
})

export interface LoginState {
  success: boolean
  error?: string | null
  message?: string | null
  dashboardUrl?: string | null
}

function getDashboardUrl(role: "admin" | "operator" | "client"): string {
  switch (role) {
    case "admin":
      return "/admin/dashboard"
    case "operator":
      return "/dashboard/operator"
    case "client":
    default:
      return "/dashboard/client"
  }
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      error:
        validatedFields.error.flatten().fieldErrors.email?.[0] ||
        validatedFields.error.flatten().fieldErrors.password?.[0],
    }
  }

  const { email, password } = validatedFields.data

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error("SignIn Error:", signInError.message)
    return { success: false, error: "Credenziali non valide." }
  }

  // After successful sign-in, get the user to determine their role
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: "Utente non trovato dopo il login." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !profile) {
    return { success: false, error: "Impossibile recuperare il profilo utente." }
  }

  const dashboardUrl = getDashboardUrl(profile.role as "admin" | "operator" | "client")

  // This is the robust pattern: return success and the URL to the client.
  // The client will handle the redirection.
  return {
    success: true,
    dashboardUrl: dashboardUrl,
  }
}
