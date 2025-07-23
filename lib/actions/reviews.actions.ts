"use server"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createReview(reviewData: { consultation_id: string; rating: number; comment: string }) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "User not authenticated" }

  const adminSupabase = createAdminClient()
  const { data, error } = await adminSupabase
    .from("reviews")
    .insert({
      ...reviewData,
      user_id: user.id,
    })
    .select()

  if (error) {
    console.error("Error creating review:", error)
    return { error }
  }

  revalidatePath(`/operator/*`)
  return { data }
}

export async function getPendingReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles:user_id(full_name)")
    .eq("status", "pending")
  return { data, error }
}

export async function getModeratedReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select("*, profiles:user_id(full_name)")
    .neq("status", "pending")
  return { data, error }
}

export async function moderateReview(reviewId: string, status: "approved" | "rejected") {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("reviews").update({ status }).eq("id", reviewId).select()
  if (error) {
    console.error("Error moderating review:", error)
    return { error }
  }
  revalidatePath("/admin/reviews")
  return { data }
}
