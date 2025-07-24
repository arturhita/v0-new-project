"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()
  const origin = headers().get("origin")

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Supabase signup error:", error)
    if (error.message.includes("User already registered")) {
      return { error: "Utente già registrato con questa email." }
    }
    if (error.message.includes("Password should be at least 6 characters")) {
      return { error: "La password deve contenere almeno 6 caratteri." }
    }
    return { error: "Impossibile creare l'account. Riprova." }
  }

  return { success: true, error: null }
}
