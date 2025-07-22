"use server"

import type { z } from "zod"
import { createClient } from "@/lib/supabase/server"
import type { loginSchema, registerSchema } from "@/lib/schemas"
import { redirect } from "next/navigation"
import type { AuthError } from "@supabase/supabase-js"

// Helper function to handle Supabase errors
function handleError(error: AuthError) {
  console.error("Authentication error:", error.message)
  return {
    success: false,
    message: error.message || "An unexpected error occurred.",
  }
}

export async function login(values: z.infer<typeof loginSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return handleError(error)
  }

  // On successful login, the AuthContext will handle the redirect.
  return {
    success: true,
    message: "Login successful. Redirecting...",
  }
}

export async function register(values: z.infer<typeof registerSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
      },
    },
  })

  if (error) {
    return handleError(error)
  }

  // On successful registration, the AuthContext will handle the redirect.
  return {
    success: true,
    message: "Registration successful. Please check your email to verify your account.",
  }
}

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error("Sign out error:", error)
    // Even if there's an error, we redirect to login.
  }

  redirect("/login")
}
