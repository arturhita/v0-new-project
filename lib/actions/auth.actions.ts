"use server"

import { createClient } from "@/lib/supabase/server"
import { loginSchema, signupSchema } from "@/lib/schemas"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export interface LoginState {
  error?: string | null
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login Error:", error.message)
    return { error: "Credenziali di accesso non valide." }
  }

  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return { error: "Profilo utente non trovato. Contatta l'assistenza." }
    }

    let dashboardUrl = "/dashboard/client" // Default
    switch (profile.role) {
      case "admin":
        dashboardUrl = "/admin/dashboard"
        break
      case "operator":
        dashboardUrl = "/dashboard/operator"
        break
    }
    // This will throw a NEXT_REDIRECT error and stop execution,
    // which is the intended way to handle redirects in Server Actions.
    redirect(dashboardUrl)
  }

  return { error: "Si è verificato un errore imprevisto durante il login." }
}

export interface SignupState {
  success: boolean
  message: string
}

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati inseriti non validi. Assicurati che la password sia di almeno 6 caratteri.",
    }
  }

  const { name, email, password } = validatedFields.data
  const origin = headers().get("origin")
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "client",
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { success: false, message: "Un utente con questa email è già registrato." }
    }
    console.error("Signup Error:", error)
    return { success: false, message: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  return { success: true, message: "Registrazione completata! Controlla la tua email per verificare il tuo account." }
}
