"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import type { z } from "zod"
import type { loginSchema, signupSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: "Credenziali di accesso non valide. Riprova." }
  }

  // Il redirect viene gestito dal middleware o dal client dopo la modifica dello stato auth
  return { success: true }
}

export async function signup(values: z.infer<typeof signupSchema>) {
  const origin = headers().get("origin")
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.name,
        role: "client",
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    console.error("Signup Error:", error)
    return { error: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  return { success: true }
}
