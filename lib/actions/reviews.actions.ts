"use server"
import { supabaseAdmin } from "@/lib/supabase/admin"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReview(reviewData: {
  operator_id: string
  rating: number
  comment: string
  consultation_id: string
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase.from("reviews").insert({
    ...reviewData,
    client_id: user.id,
    status: "pending",
  })

  if (error) {
    console.error("Error creating review:", error)
    return { error: error.message }
  }
  return { success: true }
}

export async function getPendingReviews() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*, profiles:client_id(full_name), operator:operator_id(full_name)")
    .eq("status", "pending")
  if (error) return []
  return data
}

export async function getModeratedReviews() {
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select("*, profiles:client_id(full_name), operator:operator_id(full_name)")
    .neq("status", "pending")
  if (error) return []
  return data
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected", admin_comment?: string) {
  const { error } = await supabaseAdmin
    .from("reviews")
    .update({ status, admin_comment, moderated_at: new Date().toISOString() })
    .eq("id", reviewId)
  if (error) {
    console.error("Error moderating review:", error)
    return { error: error.message }
  }
  revalidatePath("/admin/reviews")
  return { success: true }
}
