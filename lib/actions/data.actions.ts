"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator } from "@/types/operator.types"
import type { Article } from "@/types/article.types"

export interface HomepageData {
  featuredOperators: Operator[]
  recentArticles: Article[]
}

export async function getHomepageData(): Promise<{ data: HomepageData | null; error: string | null }> {
  const supabase = createClient()

  try {
    const [operatorsResult, articlesResult] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id, user_id, full_name, avatar_url, title, specialties, average_rating, total_reviews, online_status, services",
        )
        .eq("role", "operator")
        .eq("status", "approved")
        .order("average_rating", { ascending: false, nulls: "last" })
        .limit(8),
      supabase.from("articles").select("*").order("created_at", { ascending: false }).limit(3),
    ])

    if (operatorsResult.error)
      throw new Error(`Errore nel caricamento degli operatori: ${operatorsResult.error.message}`)
    if (articlesResult.error) throw new Error(`Errore nel caricamento degli articoli: ${articlesResult.error.message}`)

    const data: HomepageData = {
      featuredOperators: operatorsResult.data as Operator[],
      recentArticles: articlesResult.data as Article[],
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching homepage data:", error)
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred"
    return { data: null, error: errorMessage }
  }
}
