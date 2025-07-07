"use server"

import { revalidatePath } from "next/cache"

export interface Review {
  id: string
  userId: string
  operatorId: string
  operatorName: string
  userName: string
  userAvatar?: string
  rating: number
  comment: string
  serviceType: "chat" | "call" | "email"
  consultationId: string
  date: string
  isVerified: boolean
  isModerated: boolean
  helpfulVotes: number
  reportCount: number
}

// Simulazione database recensioni
const reviewsDB: Review[] = [
  {
    id: "r1",
    userId: "u1",
    operatorId: "op1",
    operatorName: "Stella Divina",
    userName: "Maria R.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 5,
    comment:
      "Consulenza eccellente! Stella ha una sensibilità incredibile e mi ha aiutato a vedere chiaramente la mia situazione. Consigliatissima!",
    serviceType: "chat",
    consultationId: "c1",
    date: "2024-01-15T10:30:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 12,
    reportCount: 0,
  },
  {
    id: "r2",
    userId: "u2",
    operatorId: "op1",
    operatorName: "Stella Divina",
    userName: "Giuseppe M.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 4,
    comment: "Molto professionale e precisa nelle sue letture. Mi ha dato consigli utili per il mio futuro lavorativo.",
    serviceType: "call",
    consultationId: "c2",
    date: "2024-01-12T15:45:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 8,
    reportCount: 0,
  },
  {
    id: "r3",
    userId: "u3",
    operatorId: "op1",
    operatorName: "Stella Divina",
    userName: "Anna L.",
    userAvatar: "/placeholder.svg?height=40&width=40",
    rating: 2,
    comment: "Non sono rimasta soddisfatta della consulenza.",
    serviceType: "chat",
    consultationId: "c3",
    date: "2024-01-10T09:15:00Z",
    isVerified: true,
    isModerated: true,
    helpfulVotes: 1,
    reportCount: 0,
  },
]

export async function createReview(
  reviewData: Omit<Review, "id" | "date" | "isModerated" | "helpfulVotes" | "reportCount">,
) {
  const newReview: Review = {
    ...reviewData,
    id: `r${Date.now()}`,
    date: new Date().toISOString(),
    isModerated: false, // Richiede moderazione
    helpfulVotes: 0,
    reportCount: 0,
  }

  reviewsDB.push(newReview)
  revalidatePath("/")
  revalidatePath(`/operator/${reviewData.operatorName}`)

  return { success: true, review: newReview }
}

export async function getOperatorReviews(operatorId: string) {
  const reviews = reviewsDB.filter((r) => r.operatorId === operatorId && r.isModerated)
  return reviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export async function getAllReviews() {
  return reviewsDB.filter((r) => r.isModerated).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// ✅ NUOVA FUNZIONE: Calcola media escludendo recensioni negative (rating < 3)
export async function getOperatorAverageRating(operatorId: string) {
  const reviews = reviewsDB.filter((r) => r.operatorId === operatorId && r.isModerated)

  // Esclude recensioni negative (rating < 3) dalla media
  const positiveReviews = reviews.filter((r) => r.rating >= 3)

  if (positiveReviews.length === 0) return 0

  const totalRating = positiveReviews.reduce((sum, review) => sum + review.rating, 0)
  const average = totalRating / positiveReviews.length

  return Math.round(average * 10) / 10 // Arrotonda a 1 decimale
}

export async function getOperatorReviewStats(operatorId: string) {
  const allReviews = reviewsDB.filter((r) => r.operatorId === operatorId && r.isModerated)
  const positiveReviews = allReviews.filter((r) => r.rating >= 3)
  const negativeReviews = allReviews.filter((r) => r.rating < 3)

  return {
    totalReviews: allReviews.length,
    positiveReviews: positiveReviews.length,
    negativeReviews: negativeReviews.length,
    averageRating: await getOperatorAverageRating(operatorId),
    reviewsUsedInAverage: positiveReviews.length,
  }
}

export async function voteHelpful(reviewId: string) {
  const review = reviewsDB.find((r) => r.id === reviewId)
  if (review) {
    review.helpfulVotes += 1
    revalidatePath("/")
  }
  return { success: true }
}

export async function reportReview(reviewId: string, reason: string) {
  const review = reviewsDB.find((r) => r.id === reviewId)
  if (review) {
    review.reportCount += 1
    // Se troppi report, nasconde la recensione
    if (review.reportCount >= 3) {
      review.isModerated = false
    }
  }
  return { success: true }
}

export async function moderateReview(reviewId: string, approved: boolean) {
  const review = reviewsDB.find((r) => r.id === reviewId)
  if (review) {
    review.isModerated = approved
    revalidatePath("/admin/reviews")
  }
  return { success: true }
}
