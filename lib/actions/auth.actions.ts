"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function signUp(formData: {
  email: string
  password: string
  full_name: string
  role?: "client" | "operator"
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
      options: {
        data: {
          full_name: formData.full_name,
          role: formData.role || "client",
        },
      },
    })

    if (error) throw error

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Error signing up:", error)
    return { success: false, error: error.message || "Failed to sign up" }
  }
}

export async function signIn(formData: {
  email: string
  password: string
}) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    })

    if (error) throw error

    // Get user profile to determine redirect
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      // Default redirect if profile fetch fails
      redirect("/")
    }

    // Redirect based on role
    switch (profile?.role) {
      case "admin":
        redirect("/admin")
        break
      case "operator":
        redirect("/dashboard/operator")
        break
      case "client":
      default:
        redirect("/dashboard/client")
        break
    }
  } catch (error: any) {
    console.error("Error signing in:", error)
    return { success: false, error: error.message || "Failed to sign in" }
  }
}

export async function signOut() {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error

    revalidatePath("/", "layout")
    redirect("/")
  } catch (error: any) {
    console.error("Error signing out:", error)
    return { success: false, error: error.message || "Failed to sign out" }
  }
}

export async function getCurrentUser() {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()
    if (error) throw error

    if (!user) return null

    // Get full profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (profileError) {
      console.error("Error fetching profile:", profileError)
      return { ...user, role: "client" } // Default role
    }

    return { ...user, ...profile }
  } catch (error) {
    console.error("Error getting current user:", error)
    return null
  }
}

export async function updatePassword(formData: {
  currentPassword: string
  newPassword: string
}) {
  const supabase = createClient()

  try {
    // First verify current password by attempting to sign in
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: formData.newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating password:", error)
    return { success: false, error: error.message || "Failed to update password" }
  }
}

export async function resetPassword(email: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password`,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error resetting password:", error)
    return { success: false, error: error.message || "Failed to send reset email" }
  }
}

export async function updateEmail(newEmail: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.updateUser({
      email: newEmail,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error updating email:", error)
    return { success: false, error: error.message || "Failed to update email" }
  }
}

export async function deleteAccount() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Delete user account (this will cascade to profile due to database triggers)
    const { error } = await supabase.auth.admin.deleteUser(user.id)

    if (error) throw error

    // Sign out and redirect
    await signOut()
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting account:", error)
    return { success: false, error: error.message || "Failed to delete account" }
  }
}

export async function verifyEmail(token: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error verifying email:", error)
    return { success: false, error: error.message || "Failed to verify email" }
  }
}

export async function resendVerificationEmail() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: user.email!,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Error resending verification email:", error)
    return { success: false, error: error.message || "Failed to resend verification email" }
  }
}
