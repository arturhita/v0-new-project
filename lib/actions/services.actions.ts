"use server"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveOperatorServices(services: any[]) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // Delete existing services for the operator
  const { error: deleteError } = await supabase.from("operator_services").delete().eq("operator_id", user.id)

  if (deleteError) {
    console.error("Error deleting old services:", deleteError)
    return { error: deleteError.message }
  }

  // Insert new services
  const servicesToInsert = services.map((s) => ({ ...s, operator_id: user.id }))
  const { error: insertError } = await supabase.from("operator_services").insert(servicesToInsert)

  if (insertError) {
    console.error("Error inserting new services:", insertError)
    return { error: insertError.message }
  }

  revalidatePath("/dashboard/operator/services")
  return { success: true }
}

export async function getOperatorServices() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from("operator_services").select("*").eq("operator_id", user.id)

  if (error) {
    console.error("Error fetching operator services:", error)
    return []
  }
  return data
}

export function validateServicePricing(services: any[]): string | null {
  for (const service of services) {
    if (service.price_per_minute <= 0) {
      return `Price for ${service.type} must be positive.`
    }
  }
  return null
}
