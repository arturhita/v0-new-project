"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"
import { AuthError } from "@supabase/supabase-js"

export async function login(values: z.infer<typeof LoginSchema>) {
  try {
    const supabase = createClient()

    const validatedFields = LoginSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Campi non validi!" }
    }

    const { email, password } = validatedFields.data

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Login Error:", signInError.message)
      if (signInError.message === "Invalid login credentials") {
        return { error: "Credenziali di accesso non valide." }
      }
      if (signInError.message === "Email not confirmed") {
        return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
      }
      return { error: "Si è verificato un errore durante l'accesso." }
    }

    if (!signInData.user) {
      return { error: "Utente non trovato dopo il login." }
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .single()

    if (profileError || !profile) {
      console.error("Profile fetch error:", profileError)
      await supabase.auth.signOut()
      return { error: "Impossibile recuperare il profilo utente. Contattare l'assistenza." }
    }

    // FIX: Redirect logic is now cleaner and safer using if/else.
    if (profile.role === "admin") {
      redirect("/admin/dashboard")
    } else if (profile.role === "operator") {
      redirect("/dashboard/operator")
    } else if (profile.role === "client") {
      redirect("/dashboard/client")
    } else {
      redirect("/")
    }
  } catch (error) {
    // This will catch unexpected errors, like network issues or the original JSON parse error.
    if (error instanceof AuthError) {
      return { error: `Errore di autenticazione: ${error.message}` }
    }
    console.error("Unexpected login error:", error)
    return { error: "Si è verificato un errore imprevisto. Riprova." }
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  try {
    const supabase = createClient()

    const validatedFields = RegisterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Campi non validi!" }
    }

    const { email, password, name } = validatedFields.data

    const { data, error } = await supabase.auth.signUp({
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
      console.error("Registration Error:", error)
      if (error.message.includes("User already registered")) {
        return { error: "Utente già registrato con questa email." }
      }
      return { error: "Si è verificato un errore durante la registrazione." }
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "Questo utente esiste già ma non è confermato." }
    }

    return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
  } catch (error) {
    console.error("Unexpected registration error:", error)
    return { error: "Si è verificato un errore imprevisto durante la registrazione." }
  }
}

export async function signUpAsOperator(values: z.infer<typeof RegisterSchema>) {
  try {
    const supabase = createClient()

    const validatedFields = RegisterSchema.safeParse(values)
    if (!validatedFields.success) {
      return { error: "Campi non validi!" }
    }

    const { email, password, name } = validatedFields.data

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          role: "operator",
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error("Operator Registration Error:", error)
      if (error.message.includes("User already registered")) {
        return { error: "Utente già registrato con questa email." }
      }
      return { error: "Si è verificato un errore durante la registrazione come operatore." }
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      return { error: "Questo utente esiste già ma non è confermato." }
    }

    return { success: "Registrazione come operatore completata! Controlla la tua email per confermare il tuo account." }
  } catch (error) {
    console.error("Unexpected operator registration error:", error)
    return { error: "Si è verificato un errore imprevisto durante la registrazione come operatore." }
  }
}

export async function logout() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Logout error:", error)
  }
  redirect("/login")
}
