"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function createReview(reviewData: {
  operatorId: string
  rating: number
  comment: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error("User not authenticated")

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        operator_id: reviewData.operatorId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function getPendingReviews() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      user:profiles!reviews_user_id_fkey(full_name, avatar_url),
      operator:profiles!reviews_operator_id_fkey(stage_name, avatar_url)
    `)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }

  return data || []
}

export async function getModeratedReviews() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(`
      *,
      user:profiles!reviews_user_id_fkey(full_name, avatar_url),
      operator:profiles!reviews_operator_id_fkey(stage_name, avatar_url)
    `)
    .in("status", ["approved", "rejected"])
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching moderated reviews:", error)
    return []
  }

  return data || []
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected", moderatorNotes?: string) {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from("reviews")
      .update({
        status,
        moderator_notes: moderatorNotes,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)
      .select()
      .single()

    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error("Error moderating review:", error)
    return { success: false, error: "Failed to moderate review" }
  }
}
