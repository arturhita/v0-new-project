"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import type { z } from "zod"
import type { loginSchema, signupSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    console.error("Login Error:", error.message)
    return { success: false, error: "Credenziali di accesso non valide. Riprova." }
  }

  revalidatePath("/", "layout")
  return { success: true, error: null }
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
      return { success: false, error: "Un utente con questa email è già registrato." }
    }
    console.error("Signup Error:", error)
    return { success: false, error: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  return { success: true, error: null }
}
