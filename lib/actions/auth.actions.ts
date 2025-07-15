"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { type LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: "Credenziali non valide." }
  }

  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, name } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "client",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Utente già registrato con questa email." }
    }
    console.error("Registration Error:", error.message)
    return { error: "Si è verificato un errore durante la registrazione." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}
