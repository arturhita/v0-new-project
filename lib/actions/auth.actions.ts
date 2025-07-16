"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import { LoginSchema, RegisterSchema } from "../schemas"

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
    return { error: "Credenziali non valide. Riprova." }
  }

  revalidatePath("/", "layout")
  redirect("/")
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const validatedFields = RegisterSchema.safeParse(values)

  if (!validatedFields.success) {
    return { error: "Campi non validi!" }
  }

  const { email, password, name } = validatedFields.data

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        role: "client", // Ruolo di default per i nuovi utenti
      },
    },
  })

  if (error) {
    console.error("Registration error:", error.message)
    if (error.message.includes("User already registered")) {
      return { error: "Un utente con questa email esiste già." }
    }
    return { error: "Impossibile completare la registrazione. Riprova." }
  }

  if (!data.user) {
    return { error: "Registrazione fallita. Nessun utente creato." }
  }

  revalidatePath("/", "layout")
  redirect("/login?message=Controlla la tua email per confermare la registrazione.")
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/login")
}
