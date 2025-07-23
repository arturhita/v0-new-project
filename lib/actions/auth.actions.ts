"use server"

import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { AuthError } from "@supabase/supabase-js"
import { redirect } from "next/navigation"

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Email o password non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error instanceof AuthError) {
      return { error: "Credenziali non valide. Controlla email e password." }
    }
    return { error: "Si è verificato un errore sconosciuto. Riprova." }
  }

  return { success: "Login effettuato con successo!" }
}

export async function register(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const dataToValidate = {
    ...rawData,
    terms: rawData.terms === "on",
  }

  const validatedFields = RegisterSchema.safeParse(dataToValidate)

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message
    return { error: firstError || "Dati non validi." }
  }

  const { email, password, fullName } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    console.error("Supabase SignUp Error:", error)
    return { error: "Si è verificato un errore durante la registrazione." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
