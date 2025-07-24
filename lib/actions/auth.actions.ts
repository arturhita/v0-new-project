"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const emailSchema = z.string().email({ message: "Inserisci un'email valida." })
const passwordSchema = z.string().min(6, { message: "La password deve contenere almeno 6 caratteri." })

export async function login(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const emailValidation = emailSchema.safeParse(email)
  if (!emailValidation.success) {
    return { message: emailValidation.error.errors[0].message }
  }

  const passwordValidation = passwordSchema.safeParse(password)
  if (!passwordValidation.success) {
    return { message: passwordValidation.error.errors[0].message }
  }

  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Error:", error.message)
    return { message: "Credenziali non valide. Riprova." }
  }

  return redirect("/auth/callback")
}

export async function register(prevState: any, formData: FormData) {
  const origin = headers().get("origin")
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const fullName = formData.get("full_name") as string

  if (!fullName) {
    return { message: "Il nome completo è obbligatorio." }
  }

  const emailValidation = emailSchema.safeParse(email)
  if (!emailValidation.success) {
    return { message: emailValidation.error.errors[0].message }
  }

  const passwordValidation = passwordSchema.safeParse(password)
  if (!passwordValidation.success) {
    return { message: passwordValidation.error.errors[0].message }
  }

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
    console.error("Registration Error:", error.message)
    if (error.message.includes("User already registered")) {
      return { message: "Un utente con questa email è già registrato." }
    }
    return { message: "Errore durante la registrazione. Riprova." }
  }

  return {
    message: "Registrazione avvenuta! Controlla la tua email per confermare il tuo account.",
    success: true,
  }
}
