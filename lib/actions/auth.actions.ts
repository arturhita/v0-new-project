"use server"

import type { z } from "zod"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: "Credenziali non valide. Riprova." }
  }

  if (!data.user) {
    return { error: "Login fallito, utente non trovato." }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single()

  if (profileError || !profile) {
    await supabase.auth.signOut()
    return { error: "Profilo utente non trovato. Contatta il supporto." }
  }

  // NON ESEGUIRE IL REDIRECT QUI.
  // Restituisci l'esito e il ruolo al client.
  return { success: true, role: profile.role }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: { full_name: values.fullName },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    return {
      error: error.message.includes("User already registered")
        ? "Un utente con questa email è già registrato."
        : `Errore: ${error.message}`,
    }
  }

  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}

export async function requestPasswordReset(values: z.infer<typeof resetPasswordSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
  })

  if (error) {
    return { error: "Impossibile inviare l'email di reset. Riprova." }
  }

  return { success: "Se l'email è corretta, riceverai un link per reimpostare la password." }
}

export async function updatePassword(values: z.infer<typeof updatePasswordSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: values.password })

  if (error) {
    return { error: "Impossibile aggiornare la password. Il link potrebbe essere scaduto." }
  }

  redirect("/login")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
