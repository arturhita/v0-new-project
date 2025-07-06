"use server"

import { createClient } from "@/lib/supabase/server"
import type { Profile } from "@/contexts/auth-context"

export async function getOperators(options?: {
  limit?: number
  category?: string
}): Promise<Profile[]> {
  const supabase = createClient()

  // Inizia la query selezionando tutti i profili che sono operatori
  let query = supabase.from("profiles").select("*").eq("role", "operator")

  // Se è specificata una categoria, filtra gli operatori
  // il cui array 'specializations' contiene la categoria data.
  if (options?.category) {
    query = query.contains("specializations", [options.category])
  }

  // Se è specificato un limite, applicalo
  if (options?.limit) {
    query = query.limit(options.limit)
  }

  // Ordina per disponibilità (online prima) e poi per data di creazione
  query = query.order("is_available", { ascending: false }).order("created_at", { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error("Error fetching operators:", error.message)
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
    console.error(`Error fetching operator ${stageName}:`, error.message)
    return null
  }

  return data as Profile
}

export async function getOperatorById(id: string): Promise<Profile | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("profiles").select("*").eq("id", id).single()

  if (error) {
    console.error(`Error fetching operator by ID ${id}:`, error.message)
    return null
  }

  return data as Profile
}
