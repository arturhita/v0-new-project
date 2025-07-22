"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface TimeSlot {
  id: string
  start: string
  end: string
}

export interface DayAvailability {
  active: boolean
  slots: TimeSlot[]
}

export interface WeeklyAvailability {
  [key: string]: DayAvailability
}

export async function saveOperatorAvailability(availability: any) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "User not authenticated" }
  }

  const { error } = await supabase.from("profiles").update({ availability }).eq("id", user.id)

  if (error) {
    console.error("Error saving availability:", error)
    return { success: false, message: error.message }
  }

  revalidatePath("/(platform)/dashboard/operator/availability")
  return { success: true, message: "Disponibilità salvata con successo." }
}

export async function getOperatorAvailability() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data, error } = await supabase.from("profiles").select("availability").eq("id", user.id).single()

  if (error) {
    console.error("Error fetching availability:", error)
    return null
  }

  return data.availability
}
