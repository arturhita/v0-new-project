"use server"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"

export async function login(prevState: any, formData: FormData) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(Object.fromEntries(formData.entries()))

  if (!validatedFields.success) {
    return {
      success: false,
      message: "Dati inseriti non validi.",
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
      success: false,
      message: "Credenziali non valide. Riprova.",
    }
  }

  revalidatePath("/", "layout")
  return {
    success: true,
    message: "Login effettuato con successo!",
  }
}
