"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import type { SignupState, LoginState } from "@/lib/schemas"

export async function signup(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const supabase = createClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { success: false, message: "Tutti i campi sono obbligatori." }
  }

  const { error } = await supabase.auth.signUp({
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
    console.error("Signup Error:", error)
    if (error.message.includes("User already registered")) {
      return { success: false, message: "Un utente con questa email esiste già." }
    }
    return { success: false, message: `Errore di registrazione: ${error.message}` }
  }

  return {
    success: true,
    message: "Registrazione completata! Controlla la tua email per il link di conferma.",
  }
}

export async function login(prevState: LoginState, formData: FormData): Promise<LoginState> {
  const supabase = createClient()
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { success: false, error: "Email e password sono obbligatori." }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login Error:", error)
    if (error.message === "Invalid login credentials") {
      return { success: false, error: "Credenziali non valide. Riprova." }
    }
    return { success: false, error: `Errore di accesso: ${error.message}` }
  }

  // La logica di redirect è gestita dal client tramite AuthContext
  // ma possiamo forzare un revalidate per aggiornare le pagine server
  revalidatePath("/", "layout")
  return { success: true, error: null }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
