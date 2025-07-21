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
  // The redirection will be handled by the AuthProvider on the client side
  // after the page reloads and detects the new auth state.
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

  const { data: existingUser, error: existingUserError } = await supabase
    .from("users")
    .select("id")
    .eq("email", email)
    .single()

  if (existingUser) {
    return { error: "Un utente con questa email esiste già." }
  }

  const { data, error } = await supabase.auth.signUp({
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
    console.error("Supabase signUp error:", error)
    return { error: "Impossibile creare l'account. Riprova." }
  }

  if (!data.user) {
    return { error: "Registrazione fallita. Nessun utente creato." }
  }

  // The trigger will create the profile.
  // We just need to revalidate and let the client-side handle the rest.
  revalidatePath("/", "layout")
  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}
