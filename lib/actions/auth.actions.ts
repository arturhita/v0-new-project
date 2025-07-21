"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

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
    console.error("Login error:", error.message)
    if (error.message === "Invalid login credentials") {
      return { error: "Credenziali non valide." }
    }
    if (error.message === "Email not confirmed") {
      return { error: "Email non confermata. Controlla la tua casella di posta." }
    }
    return { error: "Si è verificato un errore durante il login." }
  }

  revalidatePath("/", "layout")
  return { success: "Login effettuato con successo!" }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/")
}
