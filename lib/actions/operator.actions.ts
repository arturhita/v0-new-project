"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateOperatorProfile(formData: FormData) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated" }
  }

  const profileData = {
    full_name: formData.get("full_name") as string,
    stage_name: formData.get("stage_name") as string,
    bio: formData.get("bio") as string,
    phone_number: formData.get("phone_number") as string,
    services: formData.getAll("services").filter(Boolean) as string[],
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(profileData)
    .eq("id", user.id)
    .select("stage_name")
    .single()

  if (error) {
    console.error("Error updating profile:", error)
    return { error: "Failed to update profile." }
  }

  // Revalidate paths to ensure data is fresh
  revalidatePath("/(platform)/profile/operator")
  if (data?.stage_name) {
    revalidatePath(`/(platform)/operator/${data.stage_name}`)
  }

  return { success: true, message: "Profile updated successfully!" }
}

export async function getOperatorProfile() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "User not authenticated", profile: null }
  }

  const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching profile:", error)
    return { error: "Failed to fetch profile.", profile: null }
  }

  return { profile, error: null }
}
