"use server"

import type { z } from "zod"
import { createServerClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { AuthError } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createServerClient()

  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("Invalid login credentials")) {
        return { error: "Credenziali di accesso non valide." }
      }
    }
    return { error: "Si è verificato un errore imprevisto." }
  }

  return { success: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createServerClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, name } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "client", // Default role for standard registration
      },
    },
  })

  if (error) {
    if (error instanceof AuthError) {
      if (error.message.includes("User already registered")) {
        return { error: "Utente già registrato con questa email." }
      }
    }
    console.error("Registration Error:", error.message)
    return { error: "Si è verificato un errore durante la registrazione." }
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Questo utente esiste già ma non è confermato." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createServerClient()
  await supabase.auth.signOut()
  redirect("/")
}
