"use server"

import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

// Azione di Login robusta
export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Dati inseriti non validi. Controlla e riprova." }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    console.error("Login Error:", error.message)
    return { error: "Credenziali non valide. Riprova." }
  }

  // Forza l'aggiornamento del layout per riflettere lo stato di login
  revalidatePath("/", "layout")
  // Il reindirizzamento verrà gestito dal contesto di autenticazione sul client
  return { success: "Accesso effettuato con successo!" }
}

// Azione di Registrazione sicura
export async function register(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const firstError = validatedFields.error.errors[0]?.message
    return { error: firstError || "Dati di registrazione non validi." }
  }

  const { email, password, fullName } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Salva dati aggiuntivi nel profilo utente al momento della creazione
      data: {
        full_name: fullName,
        role: "client", // Tutti i nuovi utenti partono come 'client'
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    console.error("Supabase SignUp Error:", error)
    return { error: "Impossibile completare la registrazione. Riprova più tardi." }
  }

  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}

// Azione di Logout
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
