"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"
import type { AuthError } from "@supabase/supabase-js"

// Helper function to handle Supabase errors
function handleError(error: AuthError) {
  console.error("Authentication error:", error.message)
  // Provide user-friendly messages for common errors
  if (error.message.includes("Invalid login credentials")) {
    return { success: false, message: "Credenziali non valide. Controlla email e password." }
  }
  if (error.message.includes("User already registered")) {
    return { success: false, message: "Un utente con questa email è già registrato." }
  }
  return {
    success: false,
    message: "Si è verificato un errore. Riprova.",
  }
}

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return handleError(error)
  }

  // On successful login, the AuthContext will handle the redirect.
  return {
    success: true,
    message: "Login effettuato con successo! Reindirizzamento in corso...",
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
    },
  })

  if (error) {
    return handleError(error)
  }

  return {
    success: true,
    message: "Registrazione completata! Controlla la tua email per confermare il tuo account.",
  }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
