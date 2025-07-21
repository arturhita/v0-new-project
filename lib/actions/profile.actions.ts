"use server"

import { createClient } from "@/lib/supabase/server"

export async function getAuthenticatedUserProfile() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) throw error
    return profile
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return null
  }
}

export async function updateUserProfile(profileData: {
  fullName?: string
  bio?: string
  categories?: string[]
  services?: any
  avatarUrl?: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const updateData: any = {}
    if (profileData.fullName) updateData.full_name = profileData.fullName
    if (profileData.bio) updateData.bio = profileData.bio
    if (profileData.categories) updateData.categories = profileData.categories
    if (profileData.services) updateData.services = profileData.services
    if (profileData.avatarUrl) updateData.avatar_url = profileData.avatarUrl

    const { data, error } = await supabase.from("profiles").update(updateData).eq("id", user.id).select().single()

    if (error) throw error
    return { success: true, profile: data }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
