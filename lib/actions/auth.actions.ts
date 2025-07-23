"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

const loginSchema = z.object({
  email: z.string().email({ message: "Inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password non può essere vuota." }),
})

const registerSchema = z
  .object({
    fullName: z.string().min(2, { message: "Il nome completo è richiesto." }),
    email: z.string().email({ message: "Inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non corrispondono.",
    path: ["confirmPassword"],
  })

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = loginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { email, password } = validatedFields.data

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error || !data.user) {
    return {
      type: "error",
      message: "Credenziali non valide. Riprova.",
    }
  }

  // **LOGICA DI REINDIRIZZAMENTO POST-LOGIN**
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  let destination = "/dashboard/client" // Default
  if (profile?.role === "admin") {
    destination = "/admin"
  } else if (profile?.role === "operator") {
    destination = "/dashboard/operator"
  }

  redirect(destination)
}

export async function register(prevState: any, formData: FormData) {
  const origin = headers().get("origin")
  const supabase = createClient()
  const validatedFields = registerSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      type: "error",
      errors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { fullName, email, password } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      // Passiamo i dati del profilo che verranno usati dal trigger
      data: {
        full_name: fullName,
        // Il ruolo di default 'client' viene impostato dal trigger nel DB
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return {
        type: "error",
        message: "Un utente con questa email è già registrato.",
      }
    }
    console.error("Registration Error:", error)
    return {
      type: "error",
      message: "Si è verificato un errore durante la registrazione. Riprova.",
    }
  }

  return {
    type: "success",
    message: "Registrazione completata! Controlla la tua email per confermare il tuo account.",
  }
}
