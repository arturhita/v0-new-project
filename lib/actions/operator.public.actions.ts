"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import type { Operator } from "@/types/operator.types"

export async function getOperators(
  category?: string,
  limit = 12,
  offset = 0,
): Promise<{ operators: Operator[]; total: number }> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  let query = supabase.from("operators_view").select("*", { count: "exact" })

  if (category && category !== "tutti") {
    query = query.contains("categories", [category])
  }

  query = query.range(offset, offset + limit - 1)

  const { data, error, count } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return { operators: [], total: 0 }
  }

  return { operators: data as Operator[], total: count ?? 0 }
}

export async function getOperatorByUsername(stageName: string): Promise<Operator | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.from("operators_view").select("*").eq("stage_name", stageName).single()

  if (error) {
    console.error("Error fetching operator by username:", error)
    return null
  }

  return data as Operator
}
