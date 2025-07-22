"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getOperatorServices() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.from("profiles").select("services").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching services:", error)
    return null
  }

  return data.services
}

export function validateServicePricing(services: any): string | null {
  const { chat, call, email } = services
  if (chat.enabled && (chat.price_per_minute <= 0 || chat.price_per_minute > 100)) {
    return "Il prezzo della chat deve essere tra 0.01 e 100."
  }
  if (call.enabled && (call.price_per_minute <= 0 || call.price_per_minute > 100)) {
    return "Il prezzo delle chiamate deve essere tra 0.01 e 100."
  }
  if (email.enabled && (email.price <= 0 || email.price > 1000)) {
    return "Il prezzo dei consulti scritti deve essere tra 0.01 e 1000."
  }
  return null
}

export async function saveOperatorServices(services: any) {
  const validationError = validateServicePricing(services)
  if (validationError) {
    return { success: false, message: validationError }
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  const { error } = await supabase.from("profiles").update({ services }).eq("id", user.id)

  if (error) {
    console.error("Error saving services:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/(platform)/dashboard/operator/services")
  return { success: true, message: "Servizi aggiornati con successo." }
}
