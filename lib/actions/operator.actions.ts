"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

export async function getOperators(options?: {
  limit?: number
  specialization?: string
}): Promise<Profile[]> {
  const supabase = createClient()

  let query = supabase.from("profiles").select("*").eq("role", "operator").eq("is_available", true) // Mostriamo solo gli operatori disponibili

  if (options?.specialization) {
    // Cerca se l'array delle specializzazioni contiene il valore specificato
    query = query.contains("specializations", [options.specialization])
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }

  return data as Profile[]
}

export async function getOperatorByStageName(stageName: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("stage_name", stageName)
    .single()

  if (error) {
    console.error(`Error fetching operator ${stageName}:`, error)
    return null
  }

  return data as Profile
}
