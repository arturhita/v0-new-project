"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    switch (signInError.message) {
      case "Invalid login credentials":
        return { error: "Credenziali di accesso non valide." }
      case "Email not confirmed":
        return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
      default:
        console.error("Login Error:", signInError.message)
        return { error: "Si è verificato un errore imprevisto." }
    }
  }

  if (!signInData.user) {
    return { error: "Utente non trovato dopo il login." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", signInData.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: "Impossibile trovare il profilo utente. Contattare l'assistenza." }
  }

  return { success: true, role: profile.role as "admin" | "operator" | "client" }
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

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Questo utente esiste già ma non è confermato." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
