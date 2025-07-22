"use server"

import { createClient as createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server" // Correct import
import { revalidatePath } from "next/cache"

// This function uses the admin client to bypass RLS for admin purposes.
export async function getUsers() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("users")
    .select(
      `
        id,
        email,
        raw_user_meta_data,
        created_at,
        last_sign_in_at,
        profiles (
          role,
          full_name
        )
      `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching users:", error)
    return { error: "Could not fetch users." }
  }

  // The profiles table returns an array, but it should only have one entry per user.
  // We'll flatten this for easier use on the client.
  const formattedData = data.map((user) => ({
    ...user,
    role: user.profiles[0]?.role || "N/A",
    full_name: user.profiles[0]?.full_name || user.raw_user_meta_data?.full_name || "N/A",
  }))

  return { users: formattedData }
}

// This function uses the admin client to delete a user, which cascades.
export async function deleteUser(userId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.deleteUser(userId)

  if (error) {
    console.error("Error deleting user:", error)
    return { error: "Could not delete user." }
  }

  revalidatePath("/admin/users")
  return { success: "User deleted successfully." }
}

// This function uses the standard server client to get the currently logged-in user's profile.
// It respects RLS.
export async function getCurrentUserProfile() {
  const supabase = createClient() // Uses the standard server client

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error("Error getting current user:", authError)
    return { profile: null, error: "User not authenticated." }
  }

  const { data: profile, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profileError || !profile) {
    console.error(`Error fetching profile for user ${user.id}:`, profileError)
    return { profile: null, error: "Could not fetch user profile." }
  }

  return { profile, error: null }
}
