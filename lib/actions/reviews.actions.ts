"use server"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "../supabase/admin"

export async function createReview(reviewData: any) {
  const supabase = createClient()
  const { data, error } = await supabase.from("reviews").insert(reviewData)
  if (error) throw error
  return data
}

export async function getPendingReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles:operator_id(username)")
    .eq("status", "pending")
  if (error) throw error
  return data
}

export async function getModeratedReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles:operator_id(username)")
    .neq("status", "pending")
  if (error) throw error
  return data
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected") {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("reviews").update({ status }).eq("id", reviewId)
  if (error) throw error
  return data
}
