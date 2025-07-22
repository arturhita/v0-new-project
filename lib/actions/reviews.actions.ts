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
