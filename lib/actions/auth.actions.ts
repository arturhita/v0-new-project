"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { AuthError } from "@supabase/supabase-js"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi." }
  }

  const { email, password } = validatedFields.data

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    if (error instanceof AuthError && error.message.includes("Email not confirmed")) {
      return { error: "Registrazione non completata. Controlla la tua email per il link di conferma." }
    }
    console.error("Login error:", error.message)
    return { error: "Credenziali non valide." }
  }

  return { success: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi." }
  }

  const { email, password, fullName, role } = validatedFields.data

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    console.error("SignUp Error:", signUpError)
    return { error: "Impossibile registrare l'utente. L'email potrebbe essere già in uso." }
  }

  if (!signUpData.user) {
    return { error: "Creazione utente fallita. Riprova." }
  }

  // The database trigger 'on_auth_user_created' will handle profile creation.
  // We just need to update the role and full_name which are not available at sign-up time.
  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .update({
      full_name: fullName,
      role: role,
      // Set stage_name to full_name by default for operators
      ...(role === "operator" && { stage_name: fullName }),
    })
    .eq("id", signUpData.user.id)

  if (profileError) {
    console.error("Profile Update Error:", profileError)
    // Even if profile update fails, the user is created and can try to login.
    // The profile will have default values from the trigger.
    // A more robust solution might delete the user here, but for now, we let it pass.
    return { warning: "Utente registrato, ma si è verificato un problema nel salvataggio dei dettagli del profilo." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}
