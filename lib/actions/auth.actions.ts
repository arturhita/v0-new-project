"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password } = validatedFields.data

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    switch (signInError.message) {
      case "Invalid login credentials":
        return { error: "Credenziali di accesso non valide." }
      case "Email not confirmed":
        return { error: "Devi confermare la tua email. Controlla la tua casella di posta." }
      default:
        console.error("Login Error:", signInError.message)
        return { error: "Si è verificato un errore imprevisto." }
    }
  }

  if (!signInData.user) {
    return { error: "Utente non trovato dopo il login." }
  }

  // --- LOGICA ROBUSTA PER RECUPERARE IL PROFILO ---
  // A volte, dopo la registrazione, il profilo non è immediatamente disponibile.
  // Questo codice prova a recuperarlo più volte prima di arrendersi.
  let profile = null
  let attempts = 0
  while (attempts < 3 && !profile) {
    const { data } = await supabase.from("profiles").select("role").eq("id", signInData.user.id).single()

    if (data) {
      profile = data
    } else {
      attempts++
      if (attempts < 3) {
        // Attendi 500ms prima di riprovare
        await new Promise((resolve) => setTimeout(resolve, 500))
      }
    }
  }
  // --- FINE LOGICA ROBUSTA ---

  if (!profile) {
    console.error("Profilo non trovato dopo 3 tentativi per l'utente:", signInData.user.id)
    // L'utente è loggato, ma c'è un problema con il suo profilo.
    return { error: "Login riuscito, ma non è stato possibile caricare il tuo profilo. Contatta l'assistenza." }
  }

  // Se il profilo viene trovato, reindirizziamo l'utente dal server per un'esperienza più rapida.
  switch (profile.role) {
    case "admin":
      redirect("/admin/dashboard")
    case "operator":
      redirect("/dashboard/operator")
    case "client":
      redirect("/dashboard/client")
    default:
      redirect("/")
  }
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
  redirect("/login")
}
