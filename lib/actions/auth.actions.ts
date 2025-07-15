"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
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

export async function registerOperator(prevState: SignupState, formData: FormData): Promise<SignupState> {
  const supabase = createClient()
  const supabaseAdmin = createAdminClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!name || !email || !password) {
    return { success: false, message: "Tutti i campi sono obbligatori." }
  }

  // Step 1: Sign up the user.
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: name,
        role: "operator",
        stage_name: name, // Default stage name to full name
      },
    },
  })

  if (signUpError) {
    console.error("Operator Signup Error:", signUpError)
    if (signUpError.message.includes("User already registered")) {
      return { success: false, message: "Un operatore con questa email esiste già." }
    }
    return { success: false, message: `Errore di registrazione: ${signUpError.message}` }
  }

  if (!signUpData.user) {
    return { success: false, message: "Impossibile creare l'utente operatore." }
  }

  // Step 2: Use the admin client to manually confirm the user's email.
  const { error: updateUserError } = await supabaseAdmin.auth.admin.updateUserById(signUpData.user.id, {
    email_confirm: true,
  })

  if (updateUserError) {
    console.error("Error confirming operator email:", updateUserError)
    return {
      success: false,
      message: `L'utente è stato creato ma si è verificato un errore durante l'attivazione. Prova ad accedere o contatta il supporto.`,
    }
  }

  // Step 3: Automatically sign in the user.
  await supabase.auth.signInWithPassword({ email, password })

  revalidatePath("/", "layout")
  redirect("/dashboard/operator")
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
    if (error.message === "Email not confirmed") {
      return {
        success: false,
        error: "Devi confermare la tua email. Controlla la tua casella di posta per il link di attivazione.",
      }
    }
    return { success: false, error: `Errore di accesso: ${error.message}` }
  }

  revalidatePath("/", "layout")
  return { success: true, error: null }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
