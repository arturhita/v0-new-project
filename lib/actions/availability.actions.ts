"use server"

import { createClient } from "@/lib/supabase/server"

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

export async function saveOperatorAvailability(operatorId: string, availability: any) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_availability")
    .upsert({ operator_id: operatorId, availability_data: availability })
  if (error) throw error
  return data
}

export async function getOperatorAvailability(operatorId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("operator_availability")
    .select("availability_data")
    .eq("operator_id", operatorId)
    .single()
  if (error) {
    if (error.code === "PGRST116") return null // Not found is ok
    throw error
  }
  return data?.availability_data
}
