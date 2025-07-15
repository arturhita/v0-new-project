"use server"

import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { z } from "zod"
import type { loginSchema, signupSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    console.error("Login Error:", error.message)
    return { success: false, error: "Credenziali di accesso non valide. Riprova." }
  }

  if (data.user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()
    if (profile) {
      switch (profile.role) {
        case "admin":
          redirect("/admin/dashboard")
          break
        case "operator":
          redirect("/dashboard/operator")
          break
        case "client":
        default:
          redirect("/dashboard/client")
          break
      }
    }
  }

  // Fallback redirect in case profile is not found, though this shouldn't happen
  redirect("/")
}

export async function signup(values: z.infer<typeof signupSchema>) {
  const origin = headers().get("origin")
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.name,
        role: "client",
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes("User already registered")) {
      return { success: false, error: "Un utente con questa email è già registrato." }
    }
    console.error("Signup Error:", error)
    return { success: false, error: "Si è verificato un errore durante la registrazione. Riprova." }
  }

  return { success: true, error: null }
}
