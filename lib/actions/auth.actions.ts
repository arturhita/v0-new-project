"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    console.error("Login Error:", error.message)
    return { success: false, message: "Credenziali non valide. Controlla email e password." }
  }

  return { success: true, message: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  // Step 1: Sign up the user in the 'auth.users' table.
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
  })

  if (authError) {
    console.error("Auth SignUp Error:", authError.message)
    if (authError.message.includes("User already registered")) {
      return { success: false, message: "Un utente con questa email è già registrato." }
    }
    return { success: false, message: "Si è verificato un errore durante la registrazione." }
  }

  if (!authData.user) {
    return { success: false, message: "Registrazione fallita, utente non creato." }
  }

  // Step 2: Manually insert the profile into the 'public.profiles' table.
  // This is the new, correct approach that avoids all permission issues.
  const { error: profileError } = await supabase.from("profiles").insert({
    id: authData.user.id,
    full_name: values.fullName,
    role: "client", // Default role for new users
  })

  if (profileError) {
    console.error("Profile Creation Error:", profileError.message)
    // This is a critical error. We should inform the user.
    // In a real-world scenario, you might want to delete the auth user as well to allow a retry.
    return {
      success: false,
      message: "L'utente è stato creato ma non è stato possibile creare il profilo. Contatta l'assistenza.",
    }
  }

  return {
    success: true,
    message: "Registrazione completata! Controlla la tua email per confermare il tuo account.",
  }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
