"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"

export async function signOut() {
  const supabase = createClient()
  await supabase.auth.signOut()
  return redirect("/login")
}

export async function sendPasswordResetEmail(email: string) {
  const supabase = createClient()
  const origin = headers().get("origin") // Get the origin from the request headers

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/reset-password`,
  })

  if (error) {
    console.error("Password reset error:", error)
    return { success: false, message: "Errore durante l'invio dell'email. Riprova." }
  }

  return { success: true, message: "Se l'email è corretta, riceverai un link per reimpostare la password." }
}

export async function resetPassword(code: string, newPassword: string) {
  const supabase = createClient()

  // First, exchange the code for a session
  const { data: sessionData, error: sessionError } = await supabase.auth.exchangeCodeForSession(code)

  if (sessionError || !sessionData.user) {
    console.error("Password reset session error:", sessionError)
    return { success: false, message: "Link di reset non valido o scaduto. Riprova." }
  }

  // Then, update the user's password
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    console.error("Password update error:", updateError)
    return { success: false, message: "Errore durante l'aggiornamento della password. Riprova." }
  }

  // Sign out the user after password change for security
  await supabase.auth.signOut()

  return { success: true, message: "Password aggiornata con successo! Ora puoi effettuare il login." }
}
