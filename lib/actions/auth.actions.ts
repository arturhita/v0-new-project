"use server"

import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import { loginSchema, type signupSchema } from "@/lib/schemas"
import { headers } from "next/headers"

export interface LoginState {
  success: boolean
  error?: string | null
  role?: "admin" | "operator" | "client" | null
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { success: false, error: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login Error:", error.message)
    return { success: false, error: "Credenziali di accesso non valide." }
  }

  if (data.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut()
      return { success: false, error: "Profilo utente non trovato." }
    }

    return { success: true, role: profile.role }
  }

  return { success: false, error: "Si è verificato un errore imprevisto." }
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
