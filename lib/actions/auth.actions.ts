"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { headers } from "next/headers"

const LoginSchema = z.object({
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

const RegisterSchema = z
  .object({
    fullName: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
    email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.literal(true, {
      errorMap: () => ({ message: "Devi accettare i Termini di Servizio." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Error:", error.message)
    return { error: "Credenziali non valide. Riprova." }
  }

  // On success, return an empty object.
  // The session cookie is now set, and the client-side AuthProvider will detect the change.
  // This is the key to preventing the race condition.
  return {}
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message
    return { error: firstError }
  }

  const { fullName, email, password } = validatedFields.data
  const origin = headers().get("origin")
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Registration Error:", error.message)
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    return { error: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  return { success: "Registrazione avvenuta! Controlla la tua email per confermare il tuo account." }
}
