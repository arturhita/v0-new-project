"use server"

import { revalidatePath } from "next/cache"
import { createAdminClient } from "@/lib/supabase/admin"
import { createClient } from "@/lib/supabase/server"

export async function getPendingReviews() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      client:profiles!client_id (full_name, avatar_url),
      operator:profiles!operator_id (full_name)
    `,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending reviews:", error)
    return { error: "Impossibile recuperare le recensioni." }
  }
  return { data }
}

export async function approveReview(reviewId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", reviewId)

  if (error) {
    return { success: false, message: "Errore durante l'approvazione." }
  }
  revalidatePath("/admin/reviews")
  return { success: true }
}

export async function rejectReview(reviewId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("reviews").update({ status: "rejected" }).eq("id", reviewId)

  if (error) {
    return { success: false, message: "Errore durante il rifiuto." }
  }
  revalidatePath("/admin/reviews")
  return { success: true }
}

// Funzione per il frontend per lasciare una recensione
export async function submitReview(formData: FormData) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Devi essere loggato per lasciare una recensione." }
  }

  const reviewData = {
    client_id: user.id,
    operator_id: formData.get("operator_id") as string,
    consultation_id: formData.get("consultation_id") as string,
    rating: Number(formData.get("rating")),
    comment: formData.get("comment") as string,
  }

  const { error } = await supabase.from("reviews").insert(reviewData)

  if (error) {
    console.error("Error submitting review:", error)
    return { error: "Impossibile inviare la recensione." }
  }

  revalidatePath(`/operator/${formData.get("operator_slug")}`)
  return { success: true }
}
