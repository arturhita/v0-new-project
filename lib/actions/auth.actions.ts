"use server"

import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return { error: "Campi non validi." }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenziali non valide." }
  }

  revalidatePath("/", "layout")
  return { success: "Accesso effettuato con successo! Verrai reindirizzato..." }
}

export async function register(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { error: firstError || "Dati di input non validi." }
  }

  const { email, password, fullName, role } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: role,
      },
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    console.error("Supabase signUp error:", error)
    return { error: "Impossibile creare l'account. Riprova." }
  }

  revalidatePath("/", "layout")
  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
}
