"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import createServerClient from "@/lib/supabase/server"
import type { z } from "zod"
import type { LoginSchema, RegisterSchema } from "../schemas"

export async function login(formData: z.infer<typeof LoginSchema>) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signInWithPassword(formData)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  redirect("/admin/dashboard") // Or user dashboard
}

export async function register(formData: z.infer<typeof RegisterSchema>) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signUp({
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        full_name: formData.fullName,
        role: "client",
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: "Controlla la tua email per verificare il tuo account." }
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function requestPasswordReset(email: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/update-password`,
  })

  if (error) {
    return { error: error.message }
  }
  return { success: "Controlla la tua email per il link di reset." }
}

export async function updatePassword(password: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return { error: error.message }
  }

  redirect("/login")
}

export async function signUpAsOperator(formData: any) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "User not found" }

  const { error } = await supabase.from("profiles").update({ role: "operator" }).eq("id", user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/diventa-esperto")
  return { success: "Registration successful" }
}
