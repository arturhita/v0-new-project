"use server"

import { createClient } from "@/lib/supabase/server"
import type { Review } from "@/types/review.types"
import { revalidatePath } from "next/cache"

/**
 * Recupera le recensioni per un dato operatore dal database.
 * @param operatorId L'ID dell'operatore.
 * @returns Una promessa che si risolve in un array di recensioni.
 */
export async function getReviewsForOperator(operatorId: string): Promise<Review[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      rating,
      comment,
      created_at,
      client:client_id (
        full_name,
        profile_image_url
      )
    `,
    )
    .eq("operator_id", operatorId)
    .eq("status", "approved") // Mostra solo recensioni approvate sulla pagina pubblica
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  const reviews = data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment || "",
    created_at: review.created_at,
    // @ts-ignore: Supabase types can be tricky with nested selects
    user_full_name: review.client?.full_name || "Utente Anonimo",
    // @ts-ignore
    user_avatar: review.client?.profile_image_url,
    user_id: "placeholder_user_id",
    operator_id: operatorId,
  }))

  return reviews as Review[]
}

/**
 * Crea una nuova recensione nel database.
 * Imposta lo stato su 'pending' per recensioni con 3 stelle o meno,
 * e 'approved' per quelle con 4 o 5 stelle.
 * @param reviewData I dati della recensione da creare.
 * @returns Un oggetto che indica il successo o il fallimento dell'operazione.
 */
export async function createReview(reviewData: {
  clientId: string
  operatorId: string
  rating: number
  comment: string
}) {
  const supabase = createClient()

  const status = reviewData.rating <= 3 ? "pending" : "approved"

  const { data, error } = await supabase.from("reviews").insert({
    client_id: reviewData.clientId,
    operator_id: reviewData.operatorId,
    rating: reviewData.rating,
    comment: reviewData.comment,
    status: status,
  })

  if (error) {
    console.error("Error creating review:", error)
    return { success: false, message: "Impossibile creare la recensione." }
  }

  revalidatePath(`/operator/${reviewData.operatorId}`)
  revalidatePath("/admin/reviews")
  return { success: true, data }
}

// --- NUOVE FUNZIONI PER LA MODERAZIONE ---

export interface PendingReview {
  id: string
  rating: number
  comment: string | null
  createdAt: string
  clientName: string | null
  operatorName: string | null
}

/**
 * Recupera tutte le recensioni in stato 'pending' per la moderazione.
 */
export async function getPendingReviews(): Promise<PendingReview[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("admin_reviews_view")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching pending reviews:", error.message)
    return []
  }

  return data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.created_at,
    clientName: review.client_name,
    operatorName: review.operator_name,
  }))
}

/**
 * Approva una recensione, cambiando il suo stato in 'approved'.
 * @param reviewId L'ID della recensione da approvare.
 */
export async function approveReview(reviewId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", reviewId)

  if (error) {
    console.error("Error approving review:", error.message)
    return { success: false, message: "Errore durante l'approvazione della recensione." }
  }

  revalidatePath("/admin/reviews")
  return { success: true, message: "Recensione approvata con successo." }
}

/**
 * Rifiuta una recensione, cambiando il suo stato in 'rejected'.
 * @param reviewId L'ID della recensione da rifiutare.
 */
export async function rejectReview(reviewId: string) {
  const supabase = createClient()
  const { error } = await supabase.from("reviews").update({ status: "rejected" }).eq("id", reviewId)

  if (error) {
    console.error("Error rejecting review:", error.message)
    return { success: false, message: "Errore durante il rifiuto della recensione." }
  }

  revalidatePath("/admin/reviews")
  return { success: true, message: "Recensione rifiutata." }
}
