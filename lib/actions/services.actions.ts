"use server"
import createServerClient from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveOperatorServices(services: any) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  // This assumes you have a table `operator_services`
  const { error } = await supabase.from("operator_services").delete().eq("operator_id", user.id)
  if (error) return { error: error.message }

  const servicesToInsert = services.map((s: any) => ({ ...s, operator_id: user.id }))
  const { error: insertError } = await supabase.from("operator_services").insert(servicesToInsert)
  if (insertError) return { error: insertError.message }

  revalidatePath("/dashboard/operator/services")
  return { success: true }
}

export async function getOperatorServices() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase.from("operator_services").select("*").eq("operator_id", user.id)
  if (error) return []
  return data
}

export function validateServicePricing(services: any[]): string | null {
  for (const service of services) {
    if (service.price_per_minute < 0.5 || service.price_per_minute > 10) {
      return `Il prezzo per ${service.name} deve essere tra 0.50€ e 10.00€.`
    }
  }
  return null
}
