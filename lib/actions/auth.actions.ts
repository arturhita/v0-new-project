"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { z } from "zod"
import type { LoginSchema, RegisterSchema } from "../schemas"

export async function login(values: z.infer<typeof LoginSchema>) {
  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword(values)

  if (error) {
    return { error: error.message }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  if (!profile) {
    return { error: "Impossibile recuperare i dati utente dopo il login." }
  }

  revalidatePath("/", "layout")
  return { success: true, role: profile.role }
}

export async function signup(values: z.infer<typeof RegisterSchema>) {
  const supabase = createClient()

  const { error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      data: {
        full_name: values.fullName,
        role: values.role,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath("/", "layout")
  return { success: true }
}

export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
