"use server"

import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import { loginSchema, registerSchema } from "../schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return { error: "Registrazione non completata. Controlla la tua email per il link di conferma." }
    }
    console.error("Login error:", error.message)
    return { error: "Credenziali non valide." }
  }

  // On successful login, the AuthProvider will handle redirection.
  return { success: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()
  const validatedFields = registerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  // The database trigger 'on_auth_user_created' will now handle profile creation.
  // We no longer need to create the profile manually here.
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    console.error("Registration Error:", error.message)
    return { error: "Impossibile registrare l'utente. L'email potrebbe essere già in uso." }
  }

  if (!data.session && data.user) {
    // This indicates the user was created but needs to confirm their email.
    return { success: "Registrazione quasi completata! Controlla la tua email per confermare il tuo account." }
  }

  return { error: "Si è verificato un errore imprevisto durante la registrazione." }
}
