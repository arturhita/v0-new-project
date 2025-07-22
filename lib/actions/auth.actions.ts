"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import type { z } from "zod"
import type { RegisterSchema, LoginSchema, PasswordResetSchema, UpdatePasswordSchema } from "@/lib/schemas"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: error.message }
  }

  redirect("/")
}

export async function register(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        role: "client", // Default role
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email to verify your account." }
}

export async function signUpAsOperator(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        role: "operator",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Check your email to verify your account." }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function requestPasswordReset(values: z.infer<typeof PasswordResetSchema>) {
  const supabase = createClient()
  const origin = headers().get("origin")
  const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
    redirectTo: `${origin}/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password reset link sent. Check your email." }
}

export async function updatePassword(values: z.infer<typeof UpdatePasswordSchema>) {
  const supabase = createClient()
  const { error } = await supabase.auth.updateUser({ password: values.password })

  if (error) {
    return { error: error.message }
  }

  return { success: "Password updated successfully." }
}
