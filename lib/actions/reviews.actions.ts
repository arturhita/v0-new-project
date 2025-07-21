"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"

export interface NewReviewSchema {
  user_id: string
  operator_id: string
  operator_name: string
  user_name: string
  user_avatar?: string
  rating: number
  comment: string
  service_type: "chat" | "call" | "email"
  consultation_id: string
  is_verified: boolean
}

export async function createReview(reviewData: NewReviewSchema) {
  const supabase = createAdminClient()
  const status = reviewData.rating >= 4 ? "Approved" : "Pending"

  const { data, error } = await supabase
    .from("reviews")
    .insert([{ ...reviewData, status }])
    .select()
    .single()

  if (error) {
    console.error("Error creating review:", error)
    return { success: false, error }
  }

  revalidatePath("/")
  revalidatePath(`/operator/${reviewData.operator_name}`)
  revalidatePath(`/admin/reviews`)

  return { success: true, review: data }
}

export async function getOperatorReviews(operatorId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("operator_id", operatorId)
    .eq("status", "Approved")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching operator reviews:", error)
    return []
  }
  return data
}

export async function getPendingReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(`*`)
    .eq("status", "Pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }
  return data
}

export async function getModeratedReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .in("status", ["Approved", "Rejected"])
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching moderated reviews:", error)
    return []
  }
  return data
}

export async function moderateReview(reviewId: string, approved: boolean) {
  const supabase = createAdminClient()
  const newStatus = approved ? "Approved" : "Rejected"

  const { error } = await supabase.from("reviews").update({ status: newStatus }).eq("id", reviewId)

  if (error) {
    console.error("Error moderating review:", error)
    return { success: false, error }
  }

  revalidatePath("/admin/reviews")
  return { success: true }
}

export async function getOperatorAverageRating(operatorId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("operator_id", operatorId)
    .eq("status", "Approved")
    .gte("rating", 3)

  if (error || !data || data.length === 0) return 0

  const totalRating = data.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((totalRating / data.length) * 10) / 10
}

export async function getOperatorReviewStats(operatorId: string) {
  const supabase = createAdminClient()
  const { data: allReviews, error } = await supabase
    .from("reviews")
    .select("rating")
    .eq("operator_id", operatorId)
    .eq("status", "Approved")

  if (error || !allReviews) {
    return { totalReviews: 0, positiveReviews: 0, negativeReviews: 0, averageRating: 0, reviewsUsedInAverage: 0 }
  }

  const positiveReviews = allReviews.filter((r) => r.rating >= 3)
  return {
    totalReviews: allReviews.length,
    positiveReviews: positiveReviews.length,
    negativeReviews: allReviews.filter((r) => r.rating < 3).length,
    averageRating: await getOperatorAverageRating(operatorId),
    reviewsUsedInAverage: positiveReviews.length,
  }
}

export async function voteHelpful(reviewId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.rpc("increment_helpful_votes", { review_id_param: reviewId })

  if (error) {
    console.error("Error incrementing helpful votes:", error)
    return { success: false, error }
  }
  revalidatePath("/")
  return { success: true }
}

export async function reportReview(reviewId: string) {
  const supabase = createAdminClient()
  const { data: review, error: fetchError } = await supabase
    .from("reviews")
    .select("report_count")
    .eq("id", reviewId)
    .single()
  if (fetchError || !review) return { success: false, error: fetchError }

  const newReportCount = review.report_count + 1
  const shouldUnmoderate = newReportCount >= 3

  const { error: updateError } = await supabase
    .from("reviews")
    .update({ report_count: newReportCount, ...(shouldUnmoderate && { status: "Pending" }) })
    .eq("id", reviewId)
  if (updateError) return { success: false, error: updateError }

  if (shouldUnmoderate) revalidatePath("/admin/reviews")
  return { success: true }
}
