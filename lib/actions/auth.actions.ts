"use server"

import type { z } from "zod"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { loginSchema, registerSchema, resetPasswordSchema, updatePasswordSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()

  // 1. Tenta di autenticare l'utente con email e password.
  const { data: signInData, error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    // Se le credenziali sono errate, restituisce un errore specifico.
    return { error: "Credenziali non valide. Riprova." }
  }

  // 2. Se l'autenticazione ha successo, recupera il profilo per ottenere il ruolo.
  if (signInData.user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", signInData.user.id).single()

    // 3. Esegue il reindirizzamento lato server in base al ruolo.
    const role = profile?.role
    let redirectTo = "/"
    if (role === "admin") {
      redirectTo = "/admin"
    } else if (role === "operator") {
      redirectTo = "/dashboard/operator"
    } else if (role === "client") {
      redirectTo = "/dashboard/client"
    }

    // La funzione redirect() di Next.js gestisce il reindirizzamento sul server.
    redirect(redirectTo)
  }

  // Fallback nel caso improbabile che l'utente esista ma il profilo no.
  return { error: "Errore imprevisto durante il login. Contattare l'assistenza." }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      // Passa i dati aggiuntivi che il trigger 'handle_new_user' utilizzerà.
      data: {
        full_name: values.fullName,
      },
      // URL a cui l'utente viene reindirizzato dopo aver cliccato il link di verifica.
      emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
    },
  })

  if (error) {
    // Fornisce messaggi di errore più chiari per problemi comuni.
    return {
      error: error.message.includes("User already registered")
        ? "Un utente con questa email è già registrato."
        : `Si è verificato un errore: ${error.message}`,
    }
  }

  return { success: "Registrazione completata! Controlla la tua email per il link di verifica." }
}

export async function requestPasswordReset(values: z.infer<typeof resetPasswordSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/update-password`,
  })

  if (error) {
    return { error: "Impossibile inviare l'email di reset. Riprova." }
  }

  return { success: "Se l'email è corretta, riceverai un link per reimpostare la password." }
}

export async function updatePassword(values: z.infer<typeof updatePasswordSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: values.password })

  if (error) {
    return { error: "Impossibile aggiornare la password. Il link potrebbe essere scaduto o non valido." }
  }

  // Dopo l'aggiornamento, reindirizza l'utente alla pagina di login.
  redirect("/login")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  // Reindirizza alla pagina di login dopo il logout.
  redirect("/login")
}
