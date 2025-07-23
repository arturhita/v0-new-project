"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { z } from "zod"

const LoginSchema = z.object({
  email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
  password: z.string().min(1, { message: "La password è richiesta." }),
})

const RegisterSchema = z
  .object({
    fullName: z.string().min(2, { message: "Il nome deve essere di almeno 2 caratteri." }),
    email: z.string().email({ message: "Per favore, inserisci un'email valida." }),
    password: z.string().min(8, { message: "La password deve essere di almeno 8 caratteri." }),
    confirmPassword: z.string(),
    terms: z.literal("on", {
      errorMap: () => ({ message: "Devi accettare i Termini di Servizio." }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  })

export async function login(prevState: any, formData: FormData) {
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Dati inseriti non validi." }
  }

  const { email, password } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenziali non valide. Riprova." }
  }

  // Revalidate the entire layout to ensure AuthProvider gets fresh data
  revalidatePath("/", "layout")
  redirect("/") // Redirect to home, AuthProvider will handle routing to the correct dashboard
}

export async function register(prevState: any, formData: FormData) {
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0].message
    return { error: firstError || "Dati non validi." }
  }

  const { email, password, fullName } = validatedFields.data
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    return { error: `Si è verificato un errore: ${error.message}` }
  }

  return { success: "Registrazione quasi completata! Controlla la tua email per confermare l'account." }
}
