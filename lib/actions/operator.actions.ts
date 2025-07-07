import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { DetailedOperatorProfile, OperatorCardData } from "@/types/database"

// Funzione helper per creare un client Supabase
const createSupabaseServerClient = () => {
  const cookieStore = cookies()
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Funzione per calcolare la media delle recensioni
// Nota: Supabase non supporta `avg` direttamente in questo modo, quindi lo calcoliamo dopo
const calculateAverageRating = (reviews: { rating: number }[]) => {
  if (!reviews || reviews.length === 0) return 0
  const total = reviews.reduce((acc, review) => acc + review.rating, 0)
  return Number.parseFloat((total / reviews.length).toFixed(1))
}

// Funzione per ottenere tutti gli operatori approvati e visibili
export async function getApprovedOperators(): Promise<OperatorCardData[]> {
  const supabase = createSupabaseServerClient()
  try {
    const { data: operators, error } = await supabase
      .from("profiles")
      .select(`
        id,
        full_name,
        avatar_url,
        headline,
        is_online,
        specializations,
        services (
          type,
          price_per_minute,
          price_per_consultation,
          is_active
        ),
        reviews (
          rating
        )
      `)
      .eq("role", "operator")
      .eq("application_status", "approved")
      .eq("is_visible", true)

    if (error) {
      console.error("Error fetching approved operators:", error.message)
      throw new Error(`Error fetching approved operators: ${error.message}`)
    }

    if (!operators) {
      return []
    }

    // Mappiamo i dati nel formato OperatorCardData
    return operators.map((op) => {
      const activeServices = op.services.filter((s) => s.is_active)

      const servicesForCard = activeServices.map((s) => ({
        type: s.type,
        price: s.price_per_minute ?? s.price_per_consultation,
      }))

      const averageRating = calculateAverageRating(op.reviews)
      const reviewsCount = op.reviews.length

      return {
        id: op.id,
        fullName: op.full_name,
        avatarUrl: op.avatar_url,
        headline: op.headline,
        isOnline: op.is_online,
        specializations: op.specializations || [],
        averageRating,
        reviewsCount,
        services: servicesForCard,
      }
    })
  } catch (err) {
    console.error("Caught exception in getApprovedOperators:", err)
    // Restituisce un array vuoto o gestisce l'errore come preferito
    return []
  }
}

// Funzione per ottenere gli operatori per categoria (specializzazione)
export async function getOperatorsByCategory(category: string): Promise<OperatorCardData[]> {
  const supabase = createSupabaseServerClient()
  try {
    const { data: operators, error } = await supabase
      .from("profiles")
      .select(`
                id,
                full_name,
                avatar_url,
                headline,
                is_online,
                specializations,
                services (
                    type,
                    price_per_minute,
                    price_per_consultation,
                    is_active
                ),
                reviews (
                    rating
                )
            `)
      .eq("role", "operator")
      .eq("application_status", "approved")
      .eq("is_visible", true)
      .contains("specializations", [category])

    if (error) {
      console.error(`Error fetching operators for category ${category}:`, error.message)
      throw new Error(`Error fetching operators for category ${category}: ${error.message}`)
    }

    if (!operators) {
      return []
    }

    return operators.map((op) => {
      const activeServices = op.services.filter((s) => s.is_active)
      const servicesForCard = activeServices.map((s) => ({
        type: s.type,
        price: s.price_per_minute ?? s.price_per_consultation,
      }))
      const averageRating = calculateAverageRating(op.reviews)
      const reviewsCount = op.reviews.length

      return {
        id: op.id,
        fullName: op.full_name,
        avatarUrl: op.avatar_url,
        headline: op.headline,
        isOnline: op.is_online,
        specializations: op.specializations || [],
        averageRating,
        reviewsCount,
        services: servicesForCard,
      }
    })
  } catch (err) {
    console.error(`Caught exception in getOperatorsByCategory for ${category}:`, err)
    return []
  }
}

// Funzione per ottenere il profilo dettagliato di un singolo operatore
export async function getOperatorById(operatorId: string): Promise<DetailedOperatorProfile | null> {
  const supabase = createSupabaseServerClient()
  try {
    const { data: operator, error } = await supabase
      .from("profiles")
      .select(`
                *,
                services (*),
                reviews (
                    *,
                    client_profile:profiles(full_name)
                )
            `)
      .eq("id", operatorId)
      .eq("role", "operator")
      .single()

    if (error) {
      console.error(`Error fetching operator with ID ${operatorId}:`, error.message)
      // Se l'errore è "PGRST116" (risultato non unico o non trovato), restituisci null
      if (error.code === "PGRST116") return null
      throw new Error(`Error fetching operator with ID ${operatorId}: ${error.message}`)
    }

    if (!operator) {
      return null
    }

    const averageRating = calculateAverageRating(operator.reviews)
    const reviewsCount = operator.reviews.length

    // TypeScript non può inferire il tipo di client_profile, quindi lo gestiamo con un cast
    const reviewsWithClientName = operator.reviews.map((r) => ({
      ...r,
      client_profile: r.client_profile as { full_name: string | null } | null,
    }))

    return {
      ...operator,
      services: operator.services || [],
      reviews: reviewsWithClientName,
      averageRating,
      reviewsCount,
    }
  } catch (err) {
    console.error(`Caught exception in getOperatorById for ID ${operatorId}:`, err)
    return null
  }
}
