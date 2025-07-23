"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { z } from "zod"

// --- Schema per il Login ---
const LoginSchema = z.object({
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

// --- Server Action per il Login ---
export async function loginAction(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { message: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    if (error.message.includes("Email not confirmed")) {
      return { message: "Email non confermata. Controlla la tua casella di posta." }
    }
    return { message: "Credenziali non valide. Riprova." }
  }

  redirect("/auth/callback")
}

// --- Schema per la Registrazione ---
const RegisterSchema = z
  .object({
    fullName: z.string().min(2, { message: "Il nome completo è richiesto." }),
    email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.literal("on", {
      errorMap: () => ({ message: "Devi accettare i Termini di Servizio." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"], // Associa l'errore al campo di conferma password
  })

// --- Server Action per la Registrazione ---
export async function registerAction(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    // Restituisce il primo errore di validazione trovato
    const firstError = validatedFields.error.errors[0].message
    return { message: firstError }
  }

  const { email, password, fullName } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Passa dati aggiuntivi che verranno usati dal trigger per creare il profilo
      data: {
        full_name: fullName,
      },
      // URL a cui l'utente verrà reindirizzato dopo aver cliccato il link di conferma
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error("Sign up error:", error.message)
    if (error.message.includes("User already registered")) {
      return { message: "Un utente con questa email è già registrato." }
    }
    return { message: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  // Messaggio di successo per l'utente
  return { success: "Registrazione quasi completata! Controlla la tua email per confermare l'account." }
}
