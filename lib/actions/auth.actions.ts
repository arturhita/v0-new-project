"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

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
      console.error("Login Error:", signInError)
      switch (signInError.message) {
        case "Invalid login credentials":
          return { error: "Credenziali di accesso non valide." }
        case "Email not confirmed":
          return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
        default:
          return { error: "Si è verificato un errore durante l'accesso." }
      }
    }

    if (!signInData.user) {
      return { error: "Utente non trovato dopo il login." }
    }

    // Fetch user profile with error handling
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", signInData.user.id)
      .single()

    if (profileError) {
      console.error("Profile fetch error:", profileError)
      await supabase.auth.signOut()
      return { error: "Impossibile trovare il profilo utente. Contattare l'assistenza." }
    }

    if (!profile) {
      await supabase.auth.signOut()
      return { error: "Profilo utente non trovato." }
    }

    // Successful login - redirect based on role
    switch (profile.role) {
      case "admin":
        redirect("/admin/dashboard")
      case "operator":
        redirect("/dashboard/operator")
      case "client":
        redirect("/dashboard/client")
      default:
        redirect("/")
    }
  } catch (error) {
    console.error("Unexpected login error:", error)
    return { error: "Si è verificato un errore imprevisto durante l'accesso." }
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
    redirect("/login")
  } catch (error) {
    console.error("Logout error:", error)
    redirect("/login")
  }
}
