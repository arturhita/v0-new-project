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

export async function saveOperatorAvailability(availability: WeeklyAvailability) {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: "Non autorizzato. Effettua il login.",
      }
    }

    // Verify user is an operator
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "operator") {
      return {
        success: false,
        message: "Solo gli operatori possono modificare la disponibilità.",
      }
    }

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
    const { data, error } = await supabase.rpc("update_operator_availability", {
      operator_id: user.id,
      new_availability: transformedAvailability,
    })

    if (error) {
      console.error("Error updating availability:", error)
      return {
        success: false,
        message: "Errore durante il salvataggio della disponibilità.",
      }
    }

    // Revalidate relevant paths
    revalidatePath("/dashboard/operator/availability")
    revalidatePath("/dashboard/operator")

    // Also revalidate the public profile if stage_name exists
    const { data: profileData } = await supabase.from("profiles").select("stage_name").eq("id", user.id).single()

    if (profileData?.stage_name) {
      revalidatePath(`/operator/${profileData.stage_name}`)
    }

    return {
      success: true,
      message: "Disponibilità salvata con successo!",
      data,
    }
  } catch (error: any) {
    console.error("Error in saveOperatorAvailability:", error)
    return {
      success: false,
      message: error.message || "Errore imprevisto durante il salvataggio.",
    }
  }
}

export async function getOperatorAvailability() {
  const supabase = createClient()

  try {
    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        message: "Non autorizzato. Effettua il login.",
        data: {},
      }
    }

    // Get availability using the database function
    const { data, error } = await supabase.rpc("get_operator_availability", {
      operator_id: user.id,
    })

    if (error) {
      console.error("Error fetching availability:", error)
      return {
        success: false,
        message: "Errore durante il caricamento della disponibilità.",
        data: {},
      }
    }

    // Transform back to component format
    const daysOfWeek = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"]
    const dayMapping: { [key: string]: string } = {
      Lunedì: "monday",
      Martedì: "tuesday",
      Mercoledì: "wednesday",
      Giovedì: "thursday",
      Venerdì: "friday",
      Sabato: "saturday",
      Domenica: "sunday",
    }

    const transformedAvailability: WeeklyAvailability = {}

    daysOfWeek.forEach((day) => {
      const dbKey = dayMapping[day]
      const dbData = data?.[dbKey]

      if (dbData && Array.isArray(dbData) && dbData.length > 0) {
        transformedAvailability[day] = {
          active: true,
          slots: dbData.map((slot: any, index: number) => ({
            id: `slot-${day}-${index}`,
            start: slot.start,
            end: slot.end,
          })),
        }
      } else {
        transformedAvailability[day] = {
          active: false,
          slots: [{ id: `slot-${day}-0`, start: "09:00", end: "17:00" }],
        }
      }
    })

    return {
      success: true,
      message: "Disponibilità caricata con successo.",
      data: transformedAvailability,
    }
  } catch (error: any) {
    console.error("Error in getOperatorAvailability:", error)
    return {
      success: false,
      message: error.message || "Errore imprevisto durante il caricamento.",
      data: {},
    }
  }
}
