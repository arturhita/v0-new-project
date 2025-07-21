"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import { LoginSchema, RegisterSchema } from "@/lib/schemas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const validatedFields = LoginSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi." }
  }

  const { email, password } = validatedFields.data

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: "Credenziali non valide." }
  }

  revalidatePath("/", "layout")
  // Il reindirizzamento verrà gestito dal contesto AuthProvider
  return { success: "Accesso effettuato con successo!" }
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi." }
  }

  const { fullName, email, password, role } = validatedFields.data

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
    console.error("Supabase signUp error:", error.message)
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email è già registrato." }
    }
    return { error: "Impossibile completare la registrazione." }
  }

  if (!data.session) {
    return { success: "Registrazione completata! Controlla la tua email per la verifica." }
  }

  revalidatePath("/", "layout")
  // Il reindirizzamento verrà gestito dal contesto AuthProvider
  return { success: "Registrazione completata!" }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
