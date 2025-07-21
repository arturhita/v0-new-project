"use server"
import { createClient } from "@/lib/supabase/server"
import { loginSchema, signupSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function login(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Dati non validi. Controlla i campi e riprova.",
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
    message: "Login effettuato con successo!",
    success: true,
  }
}

export async function signup(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()
  const validatedFields = signupSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Dati non validi. Controlla i campi e riprova.",
      success: false,
    }
  }

  const { email, password, full_name } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error("Signup error:", error.message)
    if (error.message.includes("User already registered")) {
      return {
        message: "Un utente con questa email è già registrato.",
        success: false,
      }
    }
    return {
      message: "Errore durante la registrazione. Riprova.",
      success: false,
    }
  }

  return {
    message: "Registrazione avvenuta! Controlla la tua email per confermare l'account.",
    success: true,
  }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
