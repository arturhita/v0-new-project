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

export async function saveOperatorAvailability(userId: string, availability: any) {
  const supabase = createClient()

  try {
    // Transform the availability data to match database format
    const transformedAvailability: any = {}

    Object.entries(availability).forEach(([day, dayData]) => {
      if (dayData.active && dayData.slots.length > 0) {
        transformedAvailability[day.toLowerCase()] = dayData.slots.map((slot) => ({
          start: slot.start,
          end: slot.end,
        }))
      }
    })

    // Update availability using the database function
    const { error } = await supabase.from("profiles").update({ availability: transformedAvailability }).eq("id", userId)

    if (error) {
      console.error("Error updating availability:", error)
      return {
        success: false,
        message: "Errore durante il salvataggio della disponibilità.",
      }
    }

    // Revalidate relevant paths
    revalidatePath("/(platform)/dashboard/operator/availability")

    return {
      success: true,
      message: "Disponibilità salvata con successo!",
    }
  } catch (error: any) {
    console.error("Error in saveOperatorAvailability:", error)
    return {
      success: false,
      message: error.message || "Errore imprevisto durante il salvataggio.",
    }
  }
}

export async function getOperatorAvailability(userId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from("profiles").select("availability").eq("id", userId).single()

  if (error) {
    console.error("Error fetching availability:", error)
    return null
  }
  return data.availability
}
