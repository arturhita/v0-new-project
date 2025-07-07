"use server"

import { createClient } from "@/lib/supabase/server"
import type { Database } from "@/types/database"

export type OperatorWithServices = Database["public"]["Tables"]["profiles"]["Row"] & {
  services: Array<Database["public"]["Tables"]["services"]["Row"]>
}

export async function getApprovedOperators(): Promise<OperatorWithServices[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)

  if (error) {
    console.error("Error fetching approved operators:", error.message)
    throw new Error(`Error fetching approved operators: ${error.message}`)
  }

  return data as OperatorWithServices[]
}

export async function getOperatorsByCategory(category: string): Promise<OperatorWithServices[]> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("role", "operator")
    .eq("application_status", "approved")
    .eq("is_visible", true)
    .contains("specializations", [category])

  if (error) {
    console.error("Error fetching operators by category:", error.message)
    throw new Error(`Error fetching operators by category: ${error.message}`)
  }

  return data as OperatorWithServices[]
}

export async function getOperatorById(operatorId: string): Promise<OperatorWithServices | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("profiles")
    .select("*, services(*)")
    .eq("id", operatorId)
    .eq("role", "operator")
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      // This means no operator was found, which is not a server error.
      return null
    }
    console.error("Error fetching operator by ID:", error.message)
    throw new Error(`Error fetching operator by ID: ${error.message}`)
  }

  return data as OperatorWithServices
}
