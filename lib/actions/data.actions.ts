"use server"

import { createClient } from "@/lib/supabase/server"

// Definiamo un tipo per l'operatore per coerenza
// Assumiamo che questi tipi siano definiti in un file come `types/operator.types.ts`
// Per ora, lo definiamo qui per chiarezza.
export interface Operator {
  id: string
  name: string
  avatarUrl: string | null
  specialization: string
  description: string
  tags: string[]
  services: {
    chatPrice?: number
    callPrice?: number
    emailPrice?: number
  }
  isOnline: boolean
  joinedDate: string | null
  rating: number
  reviewsCount: number
}

export async function getOperators(options: { limit?: number; category?: string } = {}): Promise<Operator[]> {
  const supabase = createClient()
  let query = supabase
    .from("profiles")
    .select(
      `
      id,
      full_name,
      avatar_url,
      operator_profiles (
        specialization,
        description,
        tags,
        services,
        is_online,
        created_at
      )
    `,
    )
    .eq("role", "operator")
    .not("operator_profiles", "is", null) // Assicura che solo i profili operatore completi vengano restituiti

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.category && options.category !== "tutti") {
    // @ts-ignore - Supabase types might not be perfect for contains on nested JSON
    query = query.contains("operator_profiles.tags", [options.category])
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
    return []
  }

  // Trasforma i dati grezzi di Supabase nel nostro tipo `Operator`
  const operators: Operator[] = data.map((profile: any) => ({
    id: profile.id,
    name: profile.full_name || "Operatore",
    avatarUrl: profile.avatar_url,
    // I dati del profilo operatore sono in un array, prendiamo il primo elemento
    specialization: profile.operator_profiles?.specialization || "N/D",
    description: profile.operator_profiles?.description || "Nessuna descrizione.",
    tags: profile.operator_profiles?.tags || [],
    services: profile.operator_profiles?.services || {},
    isOnline: profile.operator_profiles?.is_online || false,
    joinedDate: profile.operator_profiles?.created_at,
    // Dati di valutazione e recensioni andrebbero calcolati con query più complesse o trigger.
    // Per ora, usiamo valori di default.
    rating: 4.8,
    reviewsCount: Math.floor(Math.random() * 200) + 50,
  }))

  return operators
}
