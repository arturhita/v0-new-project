"use server"
import { createClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

export async function createReview(reviewData: {
  operator_id: string
  rating: number
  comment: string
  consultation_id: string
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "You must be logged in to leave a review." }

  const { data, error } = await supabase
    .from("reviews")
    .insert({ ...reviewData, client_id: user.id, status: "pending" })
    .select()
    .single()

  if (error) {
    console.error("Error creating review:", error)
    return { error: error.message }
  }

  return { data }
}

export async function getPendingReviews() {
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from("reviews")
    .select("*, client:profiles!client_id(full_name), operator:profiles!operator_id(full_name)")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }
  return data
}

export async function getModeratedReviews() {
  const supabase = supabaseAdmin
  const { data, error } = await supabase
    .from("reviews")
    .select("*, client:profiles!client_id(full_name), operator:profiles!operator_id(full_name)")
    .neq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching moderated reviews:", error)
    return []
  }
  return data
}

export async function moderateReview(reviewId: string, newStatus: "approved" | "rejected") {
  const supabase = supabaseAdmin
  const { error } = await supabase.from("reviews").update({ status: newStatus }).eq("id", reviewId)

  if (error) {
    console.error("Error moderating review:", error)
    return { error: error.message }
  }

  revalidatePath("/admin/reviews")
  return { success: true }
}
