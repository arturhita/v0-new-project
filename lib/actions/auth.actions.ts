"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { registerSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof z.ZodObject<{ email: z.ZodString; password: z.ZodString }>>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    if (error.message.includes("Email not confirmed")) {
      return {
        success: false,
        message: "Registrazione non completata. Controlla la tua email per il link di conferma.",
      }
    }
    return { success: false, message: error.message }
  }

  return { success: true, message: "Login effettuato con successo!" }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()

  // The trigger in the database will now handle profile creation.
  // We only need to sign up the user here.
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      // We can pass the full_name here if we want to store it in auth.users metadata
      // The trigger can then access it via new.raw_user_meta_data ->> 'full_name'
      data: {
        full_name: values.full_name,
      },
    },
  })

  if (error) {
    console.error("Sign Up Error:", error)
    return { success: false, message: error.message }
  }

  if (!data.user) {
    console.error("Sign Up Error: No user data returned.")
    return { success: false, message: "Errore durante la registrazione, nessun utente restituito." }
  }

  // The trigger creates the profile. We just need to inform the user.
  return {
    success: true,
    message: "Registrazione avvenuta con successo! Controlla la tua email per confermare il tuo account.",
  }
}
