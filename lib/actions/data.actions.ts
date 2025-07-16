import { createClient } from "@/lib/supabase/server"

export async function getOperators(options?: { limit?: number }) {
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(
      `
        id,
        role,
        created_at,
        operators (
          user_id,
          full_name,
          avatar_url,
          specialization,
          average_rating,
          reviews_count,
          bio,
          tags,
          is_online,
          chat_price_per_minute,
          call_price_per_minute,
          written_consultation_price
        )
      `,
    )
    .eq("role", "operator")
    .not("operators", "is", null) // Assicura di ottenere solo profili con un operatore associato

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data
    .map((profile) => {
      // La query assicura che operators non sia nullo, ma manteniamo il controllo per sicurezza
      if (!profile.operators) return null

      // La relazione è uno-a-uno, quindi operators è un oggetto
      const operatorData = Array.isArray(profile.operators) ? profile.operators[0] : profile.operators

      if (!operatorData) return null

      return {
        id: profile.id,
        name: operatorData.full_name || "Operatore",
        avatarUrl: operatorData.avatar_url || "/placeholder.svg",
        specialization: operatorData.specialization || "N/A",
        rating: operatorData.average_rating || 0,
        reviewsCount: operatorData.reviews_count || 0,
        description: operatorData.bio || "Nessuna descrizione.",
        tags: operatorData.tags || [],
        isOnline: operatorData.is_online || false,
        services: {
          chatPrice: operatorData.chat_price_per_minute,
          callPrice: operatorData.call_price_per_minute,
          emailPrice: operatorData.written_consultation_price,
        },
        joinedDate: profile.created_at,
      }
    })
    .filter((p): p is NonNullable<typeof p> => p !== null)
}
