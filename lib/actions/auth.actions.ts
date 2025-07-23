"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

const initialState = {
  message: "",
}

export async function signInAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const supabase = createClient()

  if (!email || !password) {
    return { message: "Email e password sono obbligatori." }
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error("Sign in error:", error.message)
    return { message: "Credenziali non valide. Riprova." }
  }

  // Il redirect scatena onAuthStateChange nel client,
  // che caricherà il profilo in modo sicuro.
  redirect("/(platform)/dashboard/client")
}
