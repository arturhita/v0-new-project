"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateProfile(profileData: {
  full_name?: string
  stage_name?: string
  phone?: string
  avatar_url?: string
  bio?: string
  specialties?: string[]
  categories?: string[]
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...profileData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}

export async function getProfile(userId?: string) {
  const supabase = createClient()

  try {
    let targetUserId = userId
    if (!targetUserId) {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return null
      targetUserId = user.id
    }

    const { data, error } = await supabase.from("profiles").select("*").eq("id", targetUserId).single()

    if (error) throw error

    return data
  } catch (error) {
    console.error("Error fetching profile:", error)
    return null
  }
}

export async function uploadAvatar(file: File) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const fileExt = file.name.split(".").pop()
    const fileName = `${user.id}-${Math.random()}.${fileExt}`
    const filePath = `avatars/${fileName}`

    const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, file)

    if (uploadError) throw uploadError

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath)

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: data.publicUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (updateError) throw updateError

    revalidatePath("/profile")
    return { success: true, avatarUrl: data.publicUrl }
  } catch (error) {
    console.error("Error uploading avatar:", error)
    return { success: false, error: "Failed to upload avatar" }
  }
}

export async function deleteAvatar() {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    // Get current avatar URL to delete from storage
    const { data: profile } = await supabase.from("profiles").select("avatar_url").eq("id", user.id).single()

    if (profile?.avatar_url) {
      // Extract file path from URL
      const url = new URL(profile.avatar_url)
      const filePath = url.pathname.split("/").slice(-2).join("/")

      // Delete from storage
      await supabase.storage.from("avatars").remove([filePath])
    }

    // Update profile to remove avatar URL
    const { error } = await supabase
      .from("profiles")
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error deleting avatar:", error)
    return { success: false, error: "Failed to delete avatar" }
  }
}

export async function getPublicProfile(stageName: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("profiles")
      .select(`
        *,
        reviews!reviews_operator_id_fkey(
          id,
          rating,
          comment,
          created_at,
          user:profiles!reviews_user_id_fkey(full_name, avatar_url)
        )
      `)
      .eq("stage_name", stageName)
      .eq("role", "operator")
      .eq("status", "Attivo")
      .single()

    if (error) throw error

    // Calculate average rating
    const reviews = data.reviews || []
    const averageRating =
      reviews.length > 0 ? reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length : 0

    return {
      ...data,
      average_rating: Math.round(averageRating * 10) / 10,
      reviews_count: reviews.length,
      reviews: reviews.filter((review: any) => review.user), // Only include reviews with valid users
    }
  } catch (error) {
    console.error("Error fetching public profile:", error)
    return null
  }
}

export async function updateOperatorApplication(applicationData: {
  full_name: string
  stage_name: string
  phone: string
  bio: string
  specialties: string[]
  categories: string[]
  services: {
    chat?: { enabled: boolean; price_per_minute: number }
    call?: { enabled: boolean; price_per_minute: number }
    email?: { enabled: boolean; price: number }
  }
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        ...applicationData,
        role: "operator",
        status: "Pending",
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (error) throw error

    revalidatePath("/diventa-esperto")
    return { success: true }
  } catch (error) {
    console.error("Error updating operator application:", error)
    return { success: false, error: "Failed to submit application" }
  }
}
