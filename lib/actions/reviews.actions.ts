"use server"

import { revalidatePath } from "next/cache"

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

// Mock reviews database
const mockReviews = new Map<string, any>()

export async function createReview(reviewData: NewReviewSchema) {
  try {
    const status = reviewData.rating >= 4 ? "Approved" : "Pending"
    const reviewId = `review_${Date.now()}`

    const review = {
      id: reviewId,
      ...reviewData,
      status,
      created_at: new Date().toISOString(),
    }

    mockReviews.set(reviewId, review)

    revalidatePath("/")
    revalidatePath(`/operator/${reviewData.operator_name}`)
    revalidatePath(`/admin/reviews`)

    return { success: true, review }
  } catch (error) {
    console.error("Error creating review:", error)
    return { success: false, error }
  }
}

export async function getOperatorReviews(operatorId: string) {
  const reviews = Array.from(mockReviews.values())
    .filter((review) => review.operator_id === operatorId && review.status === "Approved")
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  return reviews
}

export async function getPendingReviews() {
  const reviews = Array.from(mockReviews.values())
    .filter((review) => review.status === "Pending")
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

  return reviews
}

export async function getModeratedReviews() {
  const reviews = Array.from(mockReviews.values())
    .filter((review) => ["Approved", "Rejected"].includes(review.status))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 50)

  return reviews
}

export async function moderateReview(reviewId: string, approved: boolean) {
  try {
    const review = mockReviews.get(reviewId)
    if (!review) {
      return { success: false, error: "Review not found" }
    }

    review.status = approved ? "Approved" : "Rejected"
    mockReviews.set(reviewId, review)

    revalidatePath("/admin/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error moderating review:", error)
    return { success: false, error }
  }
}

export async function getOperatorAverageRating(operatorId: string) {
  const reviews = Array.from(mockReviews.values()).filter(
    (review) => review.operator_id === operatorId && review.status === "Approved" && review.rating >= 3,
  )

  if (reviews.length === 0) return 0

  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
  return Math.round((totalRating / reviews.length) * 10) / 10
}

export async function getOperatorReviewStats(operatorId: string) {
  const allReviews = Array.from(mockReviews.values()).filter(
    (review) => review.operator_id === operatorId && review.status === "Approved",
  )

  if (allReviews.length === 0) {
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
  try {
    const review = mockReviews.get(reviewId)
    if (!review) return { success: false, error: "Review not found" }

    review.helpful_votes = (review.helpful_votes || 0) + 1
    mockReviews.set(reviewId, review)

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error incrementing helpful votes:", error)
    return { success: false, error }
  }
}

export async function reportReview(reviewId: string) {
  try {
    const review = mockReviews.get(reviewId)
    if (!review) return { success: false, error: "Review not found" }

    const newReportCount = (review.report_count || 0) + 1
    const shouldUnmoderate = newReportCount >= 3

    review.report_count = newReportCount
    if (shouldUnmoderate) {
      review.status = "Pending"
    }

    mockReviews.set(reviewId, review)

    if (shouldUnmoderate) revalidatePath("/admin/reviews")
    return { success: true }
  } catch (error) {
    console.error("Error reporting review:", error)
    return { success: false, error }
  }
}
