"use server"

import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function submitReview(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Devi essere loggato per lasciare una recensione." }
  }

  const reviewData = {
    client_id: user.id,
    operator_id: formData.get("operator_id") as string,
    consultation_id: formData.get("consultation_id") as string,
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") as string,
    status: "pending", // All reviews require moderation
  }

  const { error } = await supabase.from("reviews").insert(reviewData)

  if (error) {
    console.error("Error submitting review:", error)
    return { success: false, message: error.message }
  }

  return { success: true, message: "Recensione inviata. Sarà visibile dopo la moderazione." }
}

export async function getPendingReviews() {
  const supabaseAdmin = createAdminClient()
  const { data, error } = await supabaseAdmin
    .from("reviews")
    .select(
      `
      *,
      client:profiles!reviews_client_id_fkey(full_name),
      operator:profiles!reviews_operator_id_fkey(full_name)
    `,
    )
    .eq("status", "pending")

  if (error) {
    console.error("Error fetching pending reviews:", error)
    return []
  }
  return data
}

export async function approveReview(reviewId: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("reviews").update({ status: "approved" }).eq("id", reviewId)
  if (error) return { success: false, message: error.message }
  revalidatePath("/admin/reviews")
  return { success: true }
}

export async function rejectReview(reviewId: string) {
  const supabaseAdmin = createAdminClient()
  const { error } = await supabaseAdmin.from("reviews").update({ status: "rejected" }).eq("id", reviewId)
  if (error) return { success: false, message: error.message }
  revalidatePath("/admin/reviews")
  return { success: true }
}
