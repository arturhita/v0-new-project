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

  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (loginError || !loginData.user) {
    return { error: "Credenziali non valide." }
  }

  // Fetch profile to get the role for direct redirection
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", loginData.user.id)
    .single()

  if (profileError || !profile) {
    // This case is unlikely if RLS is correct, but good to handle
    await supabase.auth.signOut() // Log out user if profile is missing
    return { error: "Impossibile trovare il profilo utente. Contattare l'assistenza." }
  }

  revalidatePath("/", "layout")
  return { success: "Accesso effettuato!", role: profile.role }
}

export async function register(prevState: any, formData: FormData) {
  const supabase = createClient()
  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors
    const firstError = Object.values(errors)[0]?.[0]
    return { error: firstError || "Dati di input non validi." }
  }

  const { email, password, firstName, lastName, role } = validatedFields.data

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: `${firstName} ${lastName}`,
        role: role,
        // We can add first_name and last_name to metadata if needed
        // first_name: firstName,
        // last_name: lastName,
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

  return { success: "Registrazione completata! Controlla la tua email per la verifica." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
}
