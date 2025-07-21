"use server"

import { createClient } from "@/lib/supabase/server"
import { LoginSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function login(
  prevState: { message: string; success: boolean },
  formData: FormData,
): Promise<{ message: string; success: boolean }> {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      message: "Dati inseriti non validi.",
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
    return {
      message: "Credenziali non valide. Riprova.",
      success: false,
    }
  }

  revalidatePath("/", "layout")
  return {
    message: "Login effettuato con successo! Verrai reindirizzato...",
    success: true,
  }
}
