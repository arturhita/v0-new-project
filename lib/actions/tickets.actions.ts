"use server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function getTickets() {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("tickets").select("*, users(email)")
  if (error) throw error
  return data
}
