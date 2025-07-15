"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { AuthError } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

type LoginResult = { success: true; role: "admin" | "operator" | "client" } | { error: string }

export async function login(values: z.infer<typeof LoginSchema>): Promise<LoginResult> {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    if (authError instanceof AuthError) {
      if (authError.message.includes("Invalid login credentials")) {
        return { error: "Credenziali di accesso non valide." }
      }
      if (authError.message === "Email not confirmed") {
        return {
          error: "Devi confermare la tua email. Controlla la tua casella di posta per il link di attivazione.",
        }
      }
    }
    console.error("Login Auth Error:", authError.message)
    return { error: "Si è verificato un errore imprevisto durante l'accesso." }
  }

  if (authData.user) {
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single()

    if (profileError || !profile) {
      await supabase.auth.signOut() // Clean up inconsistent state
      console.error("Login Profile Error:", profileError?.message)
      return { error: "Errore nel recupero del profilo utente. L'accesso è stato annullato." }
    }

    return { success: true, role: profile.role as "admin" | "operator" | "client" }
  }

  return { error: "Utente non trovato dopo il tentativo di login." }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

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
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
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
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/")
}
