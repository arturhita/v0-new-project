"use server"

import { createClient } from "@/lib/supabase/server"
import { z } from "zod"
import { redirect } from "next/navigation"
import { AuthError } from "@supabase/supabase-js"

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
    terms: z.literal(true, {
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

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    console.error("Login Error:", signInError.message)
    if (signInError instanceof AuthError) {
      return { error: "Credenziali non valide. Controlla email e password." }
    }
    return { error: "Si è verificato un errore sconosciuto. Riprova." }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Impossibile recuperare i dati utente dopo il login." }
  }

  const { data: rawProfile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileError || !rawProfile) {
    await supabase.auth.signOut()
    return { error: "Profilo utente non trovato. Contatta l'assistenza." }
  }

  // --- IMPLEMENTAZIONE DELLA TUA SOLUZIONE SUL SERVER ---
  // Use structuredClone for safety before accessing properties.
  const profile = structuredClone(rawProfile)

  let destination = "/"
  if (profile.role === "admin") destination = "/admin"
  else if (profile.role === "operator") destination = "/dashboard/operator"
  else if (profile.role === "client") destination = "/dashboard/client"

  redirect(destination)
}

export async function register(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries())
  const dataToValidate = {
    ...rawData,
    terms: rawData.terms === "on",
  }

  const validatedFields = RegisterSchema.safeParse(dataToValidate)

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
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    console.error("Supabase SignUp Error:", error)
    return { error: "Si è verificato un errore durante la registrazione." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
