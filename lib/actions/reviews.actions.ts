"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface Review {
  id: string
  user_id: string
  operator_id: string
  rating: number
  comment: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
  user_name?: string
  operator_name?: string
}

export async function createReview(reviewData: {
  operator_id: string
  rating: number
  comment: string
}) {
  const supabase = createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: "User not authenticated" }
    }

    const { data, error } = await supabase
      .from("reviews")
      .insert({
        user_id: user.id,
        operator_id: reviewData.operator_id,
        rating: reviewData.rating,
        comment: reviewData.comment,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    revalidatePath(`/operator/${reviewData.operator_id}`)
    return { success: true, review: data }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error: "Failed to create review" }
  }
}

export async function getReviews() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        operator:profiles!reviews_operator_id_fkey(stage_name, avatar_url)
      `)
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((review) => ({
      ...review,
      user_name: review.user?.full_name || "Anonymous User",
      operator_name: review.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return []
  }
}

export async function getOperatorReviews(operatorId: string) {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url)
      `)
      .eq("operator_id", operatorId)
      .eq("status", "approved")
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((review) => ({
      ...review,
      user_name: review.user?.full_name || "Anonymous User",
    }))
  } catch (error) {
    console.error("Error fetching operator reviews:", error)
    return []
  }
}

export async function updateReviewStatus(reviewId: string, status: "approved" | "rejected") {
  const supabase = createClient()

  try {
    const { error } = await supabase
      .from("reviews")
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", reviewId)

    if (error) throw error

    revalidatePath("/admin/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error updating review status:", error)
    return { success: false, error: "Failed to update review status" }
  }
}

export async function deleteReview(reviewId: string) {
  const supabase = createClient()

  try {
    const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

    if (error) throw error

    revalidatePath("/admin/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error deleting review:", error)
    return { success: false, error: "Failed to delete review" }
  }
}

export async function getPendingReviews() {
  const supabase = createClient()

  try {
    const { data, error } = await supabase
      .from("reviews")
      .select(`
        *,
        user:profiles!reviews_user_id_fkey(full_name, avatar_url),
        operator:profiles!reviews_operator_id_fkey(stage_name, avatar_url)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error

    return (data || []).map((review) => ({
      ...review,
      user_name: review.user?.full_name || "Anonymous User",
      operator_name: review.operator?.stage_name || "Unknown Operator",
    }))
  } catch (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }
}

export async function getReviewStats(operatorId?: string) {
  const supabase = createClient()

  try {
    let query = supabase.from("reviews").select("rating").eq("status", "approved")

    if (operatorId) {
      query = query.eq("operator_id", operatorId)
    }

    const { data, error } = await query

    if (error) throw error

    const reviews = data || []
    const totalReviews = reviews.length
    const averageRating = totalReviews > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews : 0

    const ratingDistribution = {
      5: reviews.filter((r) => r.rating === 5).length,
      4: reviews.filter((r) => r.rating === 4).length,
      3: reviews.filter((r) => r.rating === 3).length,
      2: reviews.filter((r) => r.rating === 2).length,
      1: reviews.filter((r) => r.rating === 1).length,
    }

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingDistribution,
    }
  } catch (error) {
    console.error("Error fetching review stats:", error)
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  }
}
