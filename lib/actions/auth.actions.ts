"use server"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { AuthError } from "@supabase/supabase-js"

export async function login(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Campi non validi.",
      success: false,
    }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Login error:", error.message)
    if (error instanceof AuthError) {
      return { message: "Credenziali non valide.", success: false }
    }
    return { message: "Errore durante il login. Riprova.", success: false }
  }

  // Redirect is handled by the client-side context now
  return { message: "Login effettuato con successo!", success: true }
}

export async function register(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    const errorMessages = validatedFields.error.errors.map((e) => e.message).join(" ")
    return {
      message: `Campi non validi: ${errorMessages}`,
      success: false,
    }
  }

  const { email, password, fullName, role } = validatedFields.data

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
    console.error("Registration error:", error)
    if (error.message.includes("User already registered")) {
      return { message: "Utente già registrato con questa email.", success: false }
    }
    return { message: "Errore durante la registrazione. Riprova.", success: false }
  }

  if (!data.session) {
    return { message: "Registrazione completata. Controlla la tua email per la verifica.", success: true }
  }

  // Redirect is handled by the client-side context
  return { message: "Registrazione effettuata con successo!", success: true }
}
