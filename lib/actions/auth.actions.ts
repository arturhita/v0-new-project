"use server"

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import type { z } from "zod"
import type { loginSchema, registerSchema } from "../schemas"
import { headers } from "next/headers"

export async function login(formData: z.infer<typeof loginSchema>) {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.auth.signInWithPassword(formData)

  if (error) {
    console.error("Login error:", error.message)
    return redirect("/login?message=Could not authenticate user")
  }

  return redirect("/")
}

export async function register(formData: z.infer<typeof registerSchema>) {
  const origin = headers().get("origin")
  const supabase = createSupabaseServerClient()

  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  })

  if (error) {
    console.error("Registration error:", error.message)
    return redirect("/register?message=Could not register user")
  }

  return redirect("/register?message=Check email to continue sign up process")
}

export async function signOut() {
  const supabase = createSupabaseServerClient()
  await supabase.auth.signOut()
  return redirect("/login")
}
