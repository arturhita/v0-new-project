"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

const RegisterSchema = z.object({
  fullName: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
})

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { message: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { message: "Credenziali non valide. Riprova." }
  }

  // Il redirect scatenerà onAuthStateChange sul client
  return redirect("/auth/callback")
}

export async function register(prevState: any, formData: FormData) {
  const origin = headers().get("origin")
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { message: validatedFields.error.errors[0].message, success: false }
  }

  const { email, password, fullName } = validatedFields.data
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { message: "Un utente con questa email è già registrato.", success: false }
    }
    return { message: "Errore durante la registrazione. Riprova.", success: false }
  }

  return {
    message: "Registrazione avvenuta! Controlla la tua email per confermare il tuo account.",
    success: true,
  }
}
