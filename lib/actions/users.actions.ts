import { createServerClient } from "@/lib/supabase/server"

export async function getCurrentUserProfile() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    console.log("getCurrentUserProfile: No user found.")
    return { error: "User not authenticated", profile: null }
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching user profile in server action:", error.message)
    return { error: "Failed to fetch profile", profile: null }
  }

  return { profile, error: null }
}
