"use server"

import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import { loginSchema, registerSchema } from "../schemas"
import { redirect } from "next/navigation"

const getDashboardUrl = (role: string | undefined): string => {
  if (role === "admin") return "/admin"
  if (role === "operator") return "/dashboard/operator"
  if (role === "client") return "/dashboard/client"
  return "/" // Fallback to homepage
}

export async function login(values: z.infer<typeof loginSchema>) {
  try {
    console.log("[Action: login] Attempting to log in user:", values.email)
    const supabase = createClient()
    const validatedFields = loginSchema.safeParse(values)

    if (!validatedFields.success) {
      console.error("[Action: login] Validation failed:", validatedFields.error.flatten().fieldErrors)
      return { error: "Campi non validi!" }
    }

    const { email, password } = validatedFields.data

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (loginError) {
      if (loginError.message.includes("Email not confirmed")) {
        console.warn(`[Action: login] Login failed for ${email}: Email not confirmed.`)
        return { error: "Registrazione non completata. Controlla la tua email per il link di conferma." }
      }
      console.error(`[Action: login] Supabase login error for ${email}:`, loginError.message)
      return { error: "Credenziali non valide." }
    }

    if (!loginData.user) {
      return { error: "Login fallito, utente non trovato dopo l'autenticazione." }
    }

    // Fetch profile to get the role and determine the redirect URL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", loginData.user.id)
      .single()

    if (profileError || !profile) {
      console.error(
        `[Action: login] Critical error: User ${loginData.user.id} authenticated but profile not found.`,
        profileError,
      )
      // Sign out the user to prevent an inconsistent state
      await supabase.auth.signOut()
      return { error: "Profilo utente non trovato. Contattare l'assistenza." }
    }

    const redirectTo = getDashboardUrl(profile.role)
    console.log(`[Action: login] Login successful for ${email}. Determined redirect to: ${redirectTo}`)

    return { success: "Login effettuato con successo! Reindirizzamento...", redirectTo }
  } catch (e) {
    console.error("[Action: login] UNHANDLED EXCEPTION:", e)
    return { error: "Errore imprevisto sul server durante il login." }
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()
  const validatedFields = registerSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, fullName } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    console.error("Registration Error:", error.message)
    return { error: "Impossibile registrare l'utente. L'email potrebbe essere già in uso." }
  }

  if (!data.session && data.user) {
    return { success: "Registrazione quasi completata! Controlla la tua email per confermare il tuo account." }
  }

  return { error: "Si è verificato un errore imprevisto durante la registrazione." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
