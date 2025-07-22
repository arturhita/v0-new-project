"use server"

import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import { loginSchema, registerSchema } from "../schemas"
import { redirect } from "next/navigation"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to homepage
}

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError) {
    if (loginError.message.includes("Email not confirmed")) {
      return { error: "Registrazione non completata. Controlla la tua email per il link di conferma." }
    }
    return { error: "Credenziali non valide." }
  }

  if (!loginData.user) {
    return { error: "Login fallito, utente non trovato dopo l'autenticazione." }
  }

  // Fetch profile to get the role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", loginData.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: "Profilo utente non trovato. Contattare l'assistenza." }
  }

  const redirectTo = getDashboardUrl(profile.role)

  // **LA CORREZIONE CHIAVE**
  // Eseguiamo il redirect direttamente dal server.
  // Questo interrompe l'esecuzione qui e invia una risposta di redirect al browser.
  return redirect(redirectTo)
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()
  const validatedFields = registerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, fullName } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error("Registration Error:", error.message)
    return { error: "Impossibile registrare l'utente. L'email potrebbe essere già in uso." }
  }

  if (!data.session && data.user) {
    return { success: "Registrazione quasi completata! Controlla la tua email per confermare il tuo account." }
  }

  return { error: "Si è verificato un errore imprevisto durante la registrazione." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
