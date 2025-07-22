"use server"

import type { z } from "zod"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { loginSchema, registerSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: "Credenziali non valide. Riprova." }
  }

  // Il reindirizzamento viene gestito dalla pagina server dopo il refresh
  return { success: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()

  const { error: signUpError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (signUpError) {
    if (signUpError.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    return { error: `Errore durante la registrazione: ${signUpError.message}` }
  }

  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
