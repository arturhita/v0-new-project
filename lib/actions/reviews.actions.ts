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
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching reviews:", error)
    return []
  }

  // Trasformiamo i dati per farli corrispondere al tipo `Review` che il frontend si aspetta
  const reviews = data.map((review) => ({
    id: review.id,
    rating: review.rating,
    comment: review.comment || "",
    created_at: review.created_at,
    // @ts-ignore: Supabase types can be tricky with nested selects
    user_full_name: review.client?.full_name || "Utente Anonimo",
    // @ts-ignore
    user_avatar: review.client?.profile_image_url,
    // Aggiungiamo valori placeholder per i campi mancanti nel tipo
    user_id: "placeholder_user_id", // Questo andrebbe recuperato se necessario
    operator_id: operatorId,
  }))

  return reviews as Review[]
}

/**
 * Crea una nuova recensione nel database.
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
  const { data, error } = await supabase.from("reviews").insert({
    client_id: reviewData.clientId,
    operator_id: reviewData.operatorId,
    rating: reviewData.rating,
    comment: reviewData.comment,
  })

  if (error) {
    console.error("Error creating review:", error)
    return { success: false, message: "Impossibile creare la recensione." }
  }

  // Invalidiamo la cache della pagina dell'operatore per mostrare la nuova recensione
  revalidatePath(`/esperti/${reviewData.operatorId}`)
  return { success: true, data }
}

// Le altre funzioni di gestione delle recensioni (moderazione, etc.) andrebbero
// implementate qui, interagendo con il database Supabase.
