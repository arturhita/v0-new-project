"use server"

import { createClient } from "@/lib/supabase/server"

export async function signUpAsOperator(formData: {
  email: string
  password: string
  fullName: string
  stageName: string
  bio: string
  categories: string[]
  services: any
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: "operator",
          stage_name: formData.stageName,
          bio: formData.bio,
          categories: formData.categories,
          services: formData.services,
        },
      },
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error signing up operator:", error)
    return { success: false, error: "Failed to sign up" }
  }
}

export async function login(email: string, password: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Get user profile to determine redirect
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

    return { success: true, user: data.user, role: profile?.role }
  } catch (error) {
    console.error("Error logging in:", error)
    return { success: false, error: "Invalid credentials" }
  }
}

export async function register(formData: {
  email: string
  password: string
  fullName: string
  role: "client" | "operator"
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.fullName,
          role: formData.role,
        },
      },
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error) {
    console.error("Error registering:", error)
    return { success: false, error: "Failed to register" }
  }
}
