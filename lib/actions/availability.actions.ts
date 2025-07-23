"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

export type AvailabilitySchedule = {
  id: string
  day_of_week: number
  start_time: string | null
  end_time: string | null
  is_available: boolean
}

const scheduleUpdateSchema = z.array(
  z.object({
    id: z.string().uuid(),
    day_of_week: z.number().min(1).max(7),
    is_available: z.boolean(),
    start_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, use HH:mm")
      .nullable(),
    end_time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format, use HH:mm")
      .nullable(),
  }),
)

export async function getOperatorAvailabilitySchedule(): Promise<AvailabilitySchedule[]> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("operator_availability_schedules")
    .select("*")
    .eq("operator_id", user.id)
    .order("day_of_week", { ascending: true })

  if (error) {
    console.error("Error fetching availability schedule:", error)
    throw new Error("Could not fetch availability schedule.")
  }

  // Ensure we have a full 7-day schedule, creating missing entries if necessary
  if (data.length < 7) {
    const existingDays = data.map((d) => d.day_of_week)
    const missingDays = [1, 2, 3, 4, 5, 6, 7].filter((d) => !existingDays.includes(d))

    const newEntries = missingDays.map((day) => ({
      operator_id: user.id,
      day_of_week: day,
      is_available: false,
      start_time: "09:00:00",
      end_time: "17:00:00",
    }))

    const { data: insertedData, error: insertError } = await supabase
      .from("operator_availability_schedules")
      .insert(newEntries)
      .select()

    if (insertError) {
      console.error("Error creating missing schedule entries:", insertError)
    } else if (insertedData) {
      data.push(...insertedData)
      data.sort((a, b) => a.day_of_week - b.day_of_week)
    }
  }

  return data.map((item) => ({
    id: item.id,
    day_of_week: item.day_of_week,
    is_available: item.is_available,
    start_time: item.start_time ? item.start_time.substring(0, 5) : "09:00",
    end_time: item.end_time ? item.end_time.substring(0, 5) : "17:00",
  }))
}

export async function updateOperatorAvailabilitySchedule(
  scheduleData: AvailabilitySchedule[],
): Promise<{ success: boolean; message: string }> {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, message: "Utente non autenticato." }
  }

  const validation = scheduleUpdateSchema.safeParse(scheduleData)
  if (!validation.success) {
    console.error("Validation error:", validation.error.flatten().fieldErrors)
    return { success: false, message: "Dati non validi." }
  }

  const updates = validation.data.map((day) => ({
    id: day.id,
    operator_id: user.id, // Ensure the user can only update their own schedule
    day_of_week: day.day_of_week,
    is_available: day.is_available,
    start_time: day.is_available ? day.start_time : null,
    end_time: day.is_available ? day.end_time : null,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase.from("operator_availability_schedules").upsert(updates)

  if (error) {
    console.error("Error updating availability schedule:", error)
    return { success: false, message: "Impossibile aggiornare la disponibilità." }
  }

  revalidatePath("/(platform)/dashboard/operator/availability")
  return { success: true, message: "Disponibilità aggiornata con successo!" }
}
