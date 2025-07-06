"use server"

import { createClient } from "@/lib/supabase/server"
import type { Operator, OperatorProfile } from "@/types/operator.types"

export async function getOperators(): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("role", "operator").eq("status", "Attivo")

  if (error) {
    console.error("Error fetching operators:", error)
    return []
  }
  return data as Operator[]
}

export async function getOperatorsByCategory(category: string): Promise<Operator[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "operator")
    .eq("status", "Attivo")
    .contains("categories", [category])

  if (error) {
    console.error(`Error fetching operators for category ${category}:`, error)
    return []
  }
  return data as Operator[]
}

export async function getOperatorByUsername(username: string): Promise<OperatorProfile | null> {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("*").eq("stage_name", username).single()

  if (error) {
    console.error(`Error fetching operator ${username}:`, error)
    return null
  }
  return data as OperatorProfile
}
