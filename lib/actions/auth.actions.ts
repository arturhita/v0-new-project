"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  // Explicitly check for environment variables to provide a clearer error.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const errorMessage =
      "Configurazione del server incompleta. Le variabili d'ambiente Supabase non sono state impostate."
    console.error(errorMessage)
    return { error: errorMessage }
  }

  const supabase = createClient()
  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Supabase Login Error:", signInError.message)
      if (signInError.message.includes("Invalid login credentials")) {
        return { error: "Credenziali di accesso non valide." }
      }
      if (signInError.message.includes("Email not confirmed")) {
        return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
      }
      return { error: "Si è verificato un errore durante l'accesso. Riprova." }
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
    // Catch the specific JSON parsing error and provide a helpful message.
    if (error instanceof SyntaxError) {
      const specificError =
        "Errore di comunicazione con il server di autenticazione. Verifica che le variabili d'ambiente NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY siano corrette."
      console.error("JSON Parsing Error during login:", specificError)
      return { error: specificError }
    }
    console.error("Unexpected login error:", error)
    return { error: "Si è verificato un errore imprevisto. Riprova." }
  }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
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
}

export async function signUpAsOperator(values: z.infer<typeof RegisterSchema>) {
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
}

export async function logout() {
  try {
    const supabase = createClient()
    await supabase.auth.signOut()
  } catch (error) {
    console.error("Logout error:", error)
  }
  // Redirect will happen regardless of signout success
  redirect("/login")
}
