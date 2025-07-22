"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { redirect } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(1, "La password è richiesta"),
})

const registerSchema = z
  .object({
    email: z.string().email("Email non valida"),
    password: z.string().min(6, "La password deve essere di almeno 6 caratteri"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  })

type AuthState = {
  success: boolean
  message: string
  errors?: {
    email?: string[]
    password?: string[]
    confirmPassword?: string[]
    general?: string[]
  }
}

export async function login(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      success: false,
      message: "Credenziali non valide. Riprova.",
      errors: { general: [error.message] },
    }
  }

  return {
    success: true,
    message: "Login effettuato con successo!",
  }
}

export async function register(prevState: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = createClient()
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati non validi.",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      success: false,
      message: "Errore durante la registrazione. L'utente potrebbe già esistere.",
      errors: { general: [error.message] },
    }
  }

  return {
    success: true,
    message: "Registrazione avvenuta con successo! Controlla la tua email per confermare l'account.",
  }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
