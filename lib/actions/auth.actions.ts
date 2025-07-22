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
    return { error: "Credenziali non valide." }
  }

  return { success: "Login effettuato con successo! Reindirizzamento in corso..." }
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
