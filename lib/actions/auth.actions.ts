"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Dati inseriti non validi.",
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
      message: "Credenziali non valide. Riprova.",
      success: false,
    }
  }

  revalidatePath("/", "layout")
  return {
    message: "Login effettuato con successo! Verrai reindirizzato...",
    success: true,
  }
}

export async function register(values: z.infer<typeof RegisterSchema>): Promise<{ error?: string; success?: string }> {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Dati inseriti non validi." }
  }

  const { email, password, fullName, role } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role, // Salva il ruolo nei metadati dell'utente
      },
    },
  })

  if (error) {
    console.error("Registration error:", error.message)
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    return { error: "Si è verificato un errore durante la registrazione." }
  }

  return { success: "Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
