"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"

export async function requestPasswordReset(email: string) {
  const supabase = createClient()
  const origin = headers().get("origin")

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/update-password`,
  })

  if (error) {
    console.error("Password reset error:", error)
    return { error: "Impossibile avviare il recupero password. Riprova più tardi." }
  }

  return { error: null }
}

export async function updatePassword(password: string) {
  const supabase = createClient()

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    console.error("Password update error:", error)
    return { error: "Impossibile aggiornare la password. Il link potrebbe essere scaduto." }
  }

  return { error: null }
}
