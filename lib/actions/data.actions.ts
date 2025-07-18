"use server"

import { createClient } from "@/lib/supabase/server"
import { unstable_noStore as noStore } from "next/cache"
import type { OperatorCardData } from "@/components/operator-card"

// Definisco una stringa di selezione riutilizzabile per assicurarmi di prendere sempre tutti i dati necessari per la card.
const OPERATOR_CARD_DATA_SELECT = `
  id,
  stage_name,
  full_name,
  avatar_url,
  bio,
  is_online,
  specialties,
  categories,
  services,
  average_rating,
  reviews_count
`

/**
 * Funzione universale per recuperare gli operatori da mostrare nelle vetrine (homepage, pagine di categoria).
 * @param options - Opzioni per filtrare per categoria o limitare il numero di risultati.
 * @returns Un array di operatori con tutti i dati necessari per la OperatorCard.
 */
export async function getOperatorsForShowcase({
  category,
  limit,
}: { category?: string; limit?: number } = {}): Promise<OperatorCardData[]> {
  noStore()
  const supabase = createClient()

  let query = supabase
    .from("profiles")
    .select(OPERATOR_CARD_DATA_SELECT)
    .eq("role", "operator")
    .eq("status", "Attivo") // Mostra solo operatori attivi
    .order("is_online", { ascending: false }) // Gli operatori online per primi
    .order("average_rating", { ascending: false, nullsFirst: false }) // Poi per valutazione

  if (category) {
    // Uso il case-insensitive e accent-insensitive per la ricerca delle categorie
    const { data: catData, error: catError } = await supabase.rpc("get_operators_by_category_unaccent", {
      category_name: category,
    })

    if (catError) {
      console.error("Error fetching operators by category via RPC:", catError)
      return []
    }
    // La RPC restituisce già i dati formattati, quindi li restituisco direttamente
    return catData as OperatorCardData[]
  }

  if (limit) {
    query = query.limit(limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators for showcase:", error)
    return []
  }

  return data as OperatorCardData[]
}
