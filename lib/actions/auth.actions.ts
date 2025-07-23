"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenziali non valide. Riprova." }
  }

  revalidatePath("/", "layout")
  redirect("/auth/callback")
}

export async function register(prevState: any, formData: FormData) {
  const supabase = createClient()

  const fullName = formData.get("fullName") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string
  const terms = formData.get("terms")

  if (!terms) {
    return { error: "Devi accettare i Termini di Servizio." }
  }

  if (password !== confirmPassword) {
    return { error: "Le password non coincidono." }
  }

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
    return { error: `Si è verificato un errore: ${error.message}` }
  }

  return { success: "Registrazione avvenuta con successo! Ora puoi accedere." }
}
