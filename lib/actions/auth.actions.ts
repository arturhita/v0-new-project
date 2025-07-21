"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

/**
 * Esegue il login dell'utente.
 * Questa funzione si occupa SOLO di autenticare l'utente con Supabase.
 * NON esegue alcun reindirizzamento. Il reindirizzamento è gestito
 * interamente dal client (pagina di login) per evitare race conditions.
 */
export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    switch (error.message) {
      case "Invalid login credentials":
        return { error: "Credenziali di accesso non valide." }
      case "Email not confirmed":
        return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
      default:
        console.error("Login Error:", error.message)
        return { error: "Si è verificato un errore imprevisto." }
    }
  }

  // Successo! Restituiamo solo un flag di successo.
  // Il client (pagina di login) gestirà il reindirizzamento e l'aggiornamento.
  return { success: true }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, fullName } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: "client",
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { error: "Utente già registrato con questa email." }
    }
    console.error("Registration Error:", error.message)
    return { error: "Errore del database durante il salvataggio del nuovo utente." }
  }

  if (data.user && data.user.identities && data.user.identities.length === 0) {
    return { error: "Questo utente esiste già ma non è confermato." }
  }

  return { success: "Registrazione completata! Controlla la tua email per confermare il tuo account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  // Usiamo router.refresh() sul client dopo il logout per un'esperienza più fluida,
  // ma un redirect qui è un fallback sicuro.
  redirect("/login")
}
