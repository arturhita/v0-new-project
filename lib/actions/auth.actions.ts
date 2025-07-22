"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dati non validi.",
      success: false,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    return {
      errors: null,
      message: "Credenziali non valide. Riprova.",
      success: false,
    }
  }

  return {
    errors: null,
    message: "Login effettuato con successo. Reindirizzamento...",
    success: true,
  }
}

const signupSchema = z
  .object({
    email: z.string().email({ message: "Inserisci un indirizzo email valido." }),
    password: z.string().min(6, { message: "La password deve contenere almeno 6 caratteri." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export async function signUp(prevState: any, formData: FormData) {
  const origin = headers().get("origin")
  const supabase = createClient()

  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Dati non validi.",
      success: false,
    }
  }

  const { email, password } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error.message)
    if (error.message.includes("User already registered")) {
      return {
        errors: null,
        message: "Questo indirizzo email è già registrato.",
        success: false,
      }
    }
    return {
      errors: null,
      message: "Errore durante la registrazione. Riprova.",
      success: false,
    }
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return {
      errors: null,
      message: "Questo indirizzo email è già registrato. Prova ad accedere.",
      success: false,
    }
  }

  return {
    errors: null,
    message: "Registrazione avvenuta! Controlla la tua email per confermare il tuo account.",
    success: true,
  }
}

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
